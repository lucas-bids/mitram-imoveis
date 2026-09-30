import { createClient } from "@/lib/supabase/client";

/**
 * O formato é JPEG, e não WebP, porque o feed do OLX/ZAP/VivaReal só aceita
 * JPG — o portal importa a URL para os servidores dele e rejeita WebP.
 *
 * Isso não piora o site: as URLs do Supabase passam pelo otimizador de imagem
 * do Next (`next.config.mjs`), que serve WebP/AVIF ao navegador de qualquer
 * jeito. Só o arquivo original no bucket fica maior.
 */
export const MEDIA_CONSTANTS = {
  MAX_IMAGES: 30,
  /** Mínimo exigido pelo feed dos portais. Abaixo disso o imóvel não é enviado. */
  MIN_IMAGES_FOR_FEED: 5,
  COMPRESSION: {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/jpeg",
  },
  IMAGE_EXTENSION: "jpg",
  IMAGE_CONTENT_TYPE: "image/jpeg",
  STORAGE_BUCKET: "property-images",
};

export async function uploadMediaToStorage(file: File, fileName: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(MEDIA_CONSTANTS.STORAGE_BUCKET)
    .upload(fileName, file, {
      contentType: MEDIA_CONSTANTS.IMAGE_CONTENT_TYPE,
      upsert: false,
    });
  if (error) throw error;
  
  const { data: publicUrlData } = supabase.storage
    .from(MEDIA_CONSTANTS.STORAGE_BUCKET)
    .getPublicUrl(fileName);
    
  return publicUrlData.publicUrl;
}

export async function insertMediaRecord(propertyId: string, storagePath: string, publicUrl: string, sortOrder: number, isCover: boolean) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("property_media")
    .insert({
      property_id: propertyId,
      storage_path: storagePath,
      public_url: publicUrl,
      media_type: "image",
      sort_order: sortOrder,
      is_cover: isCover,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMediaFromStorage(storagePath: string) {
  const supabase = createClient();
  await supabase.storage.from(MEDIA_CONSTANTS.STORAGE_BUCKET).remove([storagePath]);
}

export async function deleteMediaRecord(id: string) {
  const supabase = createClient();
  await supabase.from("property_media").delete().eq("id", id);
}

export async function updateMediaSortOrder(id: string, sortOrder: number) {
  const supabase = createClient();
  await supabase.from("property_media").update({ sort_order: sortOrder }).eq("id", id);
}

export async function updateCoverImage(propertyId: string, mediaId: string | null) {
  const supabase = createClient();
  if (mediaId) {
    await supabase.from("property_media").update({ is_cover: false }).eq("property_id", propertyId);
    await supabase.from("property_media").update({ is_cover: true }).eq("id", mediaId);
  }
  await supabase.from("properties").update({ cover_image_id: mediaId }).eq("id", propertyId);
}
