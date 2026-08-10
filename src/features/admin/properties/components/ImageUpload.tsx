"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import imageCompression from "browser-image-compression";
import { X, GripVertical, Star, ImagePlus } from "lucide-react";
import Image from "next/image";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { MEDIA_CONSTANTS, uploadMediaToStorage, insertMediaRecord, deleteMediaFromStorage, deleteMediaRecord, updateMediaSortOrder, updateCoverImage } from "@/features/admin/properties/components/media/mutations";

export interface PropertyMedia {
  id: string;
  storage_path: string;
  public_url: string;
  is_cover: boolean;
  sort_order: number;
}

interface ImageUploadProps {
  propertyId: string;
  initialMedia: PropertyMedia[];
  onMediaUpdate: (media: PropertyMedia[]) => void;
}

export default function ImageUpload({ propertyId, initialMedia, onMediaUpdate }: ImageUploadProps) {
  const [media, setMedia] = useState<PropertyMedia[]>(
    [...initialMedia].sort((a, b) => a.sort_order - b.sort_order)
  );
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (media.length + e.target.files.length > MEDIA_CONSTANTS.MAX_IMAGES) {
      alert(`O limite máximo é de ${MEDIA_CONSTANTS.MAX_IMAGES} imagens por imóvel.`);
      return;
    }

    setUploading(true);
    const files = Array.from(e.target.files);
    const newMediaList = [...media];

    for (const file of files) {
      try {
        const compressedFile = await imageCompression(file, MEDIA_CONSTANTS.COMPRESSION);
        const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
        
        const publicUrl = await uploadMediaToStorage(compressedFile, fileName);
        const isCover = newMediaList.length === 0;
        
        const mediaRow = await insertMediaRecord(propertyId, fileName, publicUrl, newMediaList.length, isCover);
        newMediaList.push(mediaRow);
      } catch (err) {
        console.error("Upload/Compression error:", err);
      }
    }

    setMedia(newMediaList);
    onMediaUpdate(newMediaList);
    setUploading(false);
    
    if (e.target) e.target.value = "";
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(media);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index,
    }));

    setMedia(updatedItems);
    onMediaUpdate(updatedItems);

    for (const item of updatedItems) {
      await updateMediaSortOrder(item.id, item.sort_order);
    }
  };

  const setCoverImage = async (id: string) => {
    const updatedItems = media.map((item) => ({
      ...item,
      is_cover: item.id === id,
    }));
    
    setMedia(updatedItems);
    onMediaUpdate(updatedItems);

    await updateCoverImage(propertyId, id);
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;

    await deleteMediaFromStorage(path);
    await deleteMediaRecord(id);

    const updatedItems = media.filter(item => item.id !== id);
    
    if (updatedItems.length > 0 && !updatedItems.some(i => i.is_cover)) {
      updatedItems[0].is_cover = true;
      await updateCoverImage(propertyId, updatedItems[0].id);
    } else if (updatedItems.length === 0) {
      await updateCoverImage(propertyId, null);
    }

    setMedia(updatedItems);
    onMediaUpdate(updatedItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-mitram-grayDark">Imagens do Imóvel</label>
        <span className="text-xs text-gray-500">{media.length} / 30 imagens</span>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
        <input
          type="file"
          id="images"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <label htmlFor="images" className={buttonClasses("primary", "md", "cursor-pointer")}>
          <ImagePlus size={18} />
          {uploading ? "Enviando..." : "Selecionar imagens"}
        </label>
        <p className="text-xs text-gray-500 mt-2">JPG, PNG ou WEBP. Máx 30 imagens.</p>
      </div>

      {media.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="media" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-wrap gap-4"
              >
                {media.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative group bg-white border rounded overflow-hidden w-40 h-40 ${item.is_cover ? 'border-mitram-gold ring-2 ring-mitram-gold' : 'border-gray-200'}`}
                      >
                        <div className="absolute inset-0 w-full h-full">
                          <Image
                            src={item.public_url}
                            alt="Property image"
                            fill
                            className="object-cover"
                            sizes="160px"
                          />
                        </div>
                        
                        {/* Overlay controls */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <div className="flex justify-between w-full">
                            <div {...provided.dragHandleProps} className="text-white cursor-grab active:cursor-grabbing p-1">
                              <GripVertical size={20} />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.storage_path)}
                              className="text-white hover:text-red-400 p-1"
                              title="Excluir"
                            >
                              <X size={20} />
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setCoverImage(item.id)}
                            className={`text-xs px-2 py-1 rounded w-full flex items-center justify-center gap-1 ${item.is_cover ? 'bg-mitram-gold text-white font-medium' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
                          >
                            <Star size={14} className={item.is_cover ? 'fill-white' : ''} />
                            {item.is_cover ? 'Capa' : 'Definir Capa'}
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
