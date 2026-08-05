import Image from "next/image";

interface GalleryGridProps {
  images: { public_url: string }[];
  onOpenModal: () => void;
}

export function GalleryGrid({ images, onOpenModal }: GalleryGridProps) {
  if (images.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-gray-200 flex items-center justify-center rounded-2xl">
        <span className="text-gray-500">Sem imagens disponíveis</span>
      </div>
    );
  }

  const getImgUrl = (index: number) => images[index].public_url;

  if (images.length === 1) {
    return (
      <div className="w-full h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
        <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[500px]">
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
          <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
        </div>
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group hidden md:block" onClick={onOpenModal}>
          <Image src={getImgUrl(1)} alt="Imagem 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
        </div>
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] md:h-[500px]">
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
          <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
            <Image src={getImgUrl(1)} alt="Imagem 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
          </div>
          <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
            <Image src={getImgUrl(2)} alt="Imagem 3" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
          </div>
        </div>
      </div>
    );
  }

  // 4 or more
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[400px] md:h-[500px]">
      <div className="md:col-span-2 md:row-span-2 relative w-full h-full rounded-l-2xl md:rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
        <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
      </div>
      
      <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group hidden md:block" onClick={onOpenModal}>
        <Image src={getImgUrl(1)} alt="Imagem 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
      </div>
      
      <div className="relative w-full h-full rounded-r-2xl md:rounded-2xl overflow-hidden cursor-pointer group hidden md:block" onClick={onOpenModal}>
        <Image src={getImgUrl(2)} alt="Imagem 3" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
      </div>
      
      <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group hidden md:block" onClick={onOpenModal}>
        <Image src={getImgUrl(3)} alt="Imagem 4" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
      </div>

      {images.length > 5 ? (
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group hidden md:block" onClick={onOpenModal}>
          <Image src={getImgUrl(4)} alt="Imagem 5" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xl font-bold">+{images.length - 5}</span>
          </div>
        </div>
      ) : images.length === 5 ? (
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group hidden md:block" onClick={onOpenModal}>
          <Image src={getImgUrl(4)} alt="Imagem 5" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
        </div>
      ) : (
        <div className="hidden md:block"></div>
      )}
    </div>
  );
}
