import Image from "next/image";
import { ReactNode } from "react";

interface ImageGridProps {
  className?: string;
  children: ReactNode;
}

/** Grade de 3 colunas usada para composições fotográficas nas seções da home. */
export function ImageGrid({ className, children }: ImageGridProps) {
  const classes = ["grid grid-cols-3 gap-3 md:gap-6", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}

interface ImageGridItemProps {
  src: string;
  alt: string;
  className?: string;
}

/** Célula individual da `ImageGrid`: imagem com cantos arredondados preenchendo a área do grid. */
export function ImageGridItem({ src, alt, className }: ImageGridItemProps) {
  const classes = ["relative rounded-3xl overflow-hidden", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}
