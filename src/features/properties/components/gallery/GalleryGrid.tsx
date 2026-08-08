import Image from "next/image";

interface GalleryGridProps {
  images: { public_url: string }[];
  onOpenModal: () => void;
}

function MobilePhotoIndicator({ total }: { total: number }) {
  if (total <= 1) return null;

  return (
    <div className="absolute bottom-3 right-3 z-10 md:hidden rounded-md bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
      1/{total}
    </div>
  );
}

export function GalleryGrid({ images, onOpenModal }: GalleryGridProps) {
  if (images.length === 0) {
    return (
      <div className="w-full h-[320px] md:h-[500px] bg-gray-200 flex items-center justify-center rounded-2xl">
        <span className="text-gray-500">Sem imagens disponíveis</span>
      </div>
    );
  }

  const getImgUrl = (index: number) => images[index].public_url;

  if (images.length === 1) {
    return (
      <div className="w-full h-[320px] md:h-[500px] relative rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
        <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[320px] md:h-[500px]">
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
          <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
          <MobilePhotoIndicator total={images.length} />
        </div>
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group hidden md:block" onClick={onOpenModal}>
          <Image src={getImgUrl(1)} alt="Imagem 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
        </div>
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[320px] md:h-[500px]">
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
          <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority />
          <MobilePhotoIndicator total={images.length} />
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[320px] md:h-[500px]">
      <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
        <Image src={getImgUrl(0)} alt="Imagem 1" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority sizes="(max-width: 768px) 100vw, 50vw" />
        <MobilePhotoIndicator total={images.length} />
      </div>

      <div className="hidden md:grid grid-rows-2 gap-4 h-full">
        <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
          <Image src={getImgUrl(1)} alt="Imagem 2" fill className="object-cover group-hover:scale-105 transition-transform duration-500" priority sizes="50vw" />
        </div>

        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
            <Image src={getImgUrl(2)} alt="Imagem 3" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
          </div>
          <div className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group" onClick={onOpenModal}>
            <Image src={getImgUrl(3)} alt="Imagem 4" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
            {images.length > 4 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/50">
                <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
