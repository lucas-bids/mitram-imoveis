"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Star } from "lucide-react";

export type Testimonial = {
  text: string;
  author: string;
  type: string;
  image: string;
};

const AUTOPLAY_MS = 5000;
const ANIMATION_DURATION_MS = 350;

type TestimonialsCarouselProps = {
  testimonials: Testimonial[];
};

// easeOutCubic
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function TestimonialsCarousel({
  testimonials,
}: TestimonialsCarouselProps) {
  const count = testimonials.length;
  // 3 copies for infinite loop
  const slides = [...testimonials, ...testimonials, ...testimonials];

  const [activeIndex, setActiveIndex] = useState(count);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [slideWidth, setSlideWidth] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Continuous animation state
  const positionRef = useRef(count);
  const targetRef = useRef(count);
  const fromRef = useRef(count);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Paint the current position to the DOM
  const paint = useCallback((pos: number) => {
    if (!trackRef.current || slideWidth === 0) return;

    // Center offset is 0 so the active card is the first one on the left
    const centerOffset = 0;
    const translateX = -(pos - centerOffset) * slideWidth;
    
    trackRef.current.style.transform = `translate3d(${translateX}px, 0, 0)`;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      // t is 1 when exactly at position, 0 when 1 or more slides away
      const t = Math.max(0, 1 - Math.abs(i - pos));
      card.style.setProperty("--t", t.toString());
    });
  }, [slideWidth, itemsPerView]);

  // Main animation loop
  const animate = useCallback((time: number) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }

    const elapsed = time - startTimeRef.current;
    const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
    const eased = easeOut(progress);

    const currentPos = fromRef.current + (targetRef.current - fromRef.current) * eased;
    positionRef.current = currentPos;
    
    paint(currentPos);

    if (progress < 1) {
      rafIdRef.current = requestAnimationFrame(animate);
    } else {
      // Animation finished, normalize if needed
      let normalizedTarget = targetRef.current;
      
      if (normalizedTarget < count) {
        normalizedTarget += count;
      } else if (normalizedTarget >= count * 2) {
        normalizedTarget -= count;
      }

      if (normalizedTarget !== targetRef.current) {
        targetRef.current = normalizedTarget;
        positionRef.current = normalizedTarget;
        paint(normalizedTarget);
      }
      
      setActiveIndex(targetRef.current);
      rafIdRef.current = null;
    }
  }, [paint, count]);

  const goTo = useCallback((next: number) => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    fromRef.current = positionRef.current;
    targetRef.current = next;
    startTimeRef.current = null;
    
    rafIdRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const goNext = useCallback(() => goTo(targetRef.current + 1), [goTo]);

  // Initial setup and resize
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateMetrics = () => {
      const perView = window.innerWidth >= 768 ? 3 : 1;
      setItemsPerView(perView);
      setSlideWidth(viewport.clientWidth / perView);
    };

    updateMetrics();

    const observer = new ResizeObserver(updateMetrics);
    observer.observe(viewport);
    window.addEventListener("resize", updateMetrics);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, []);

  // Repaint when slideWidth changes (e.g. resize)
  useEffect(() => {
    if (slideWidth > 0 && rafIdRef.current === null) {
      paint(positionRef.current);
    }
  }, [slideWidth, paint]);

  // Autoplay
  useEffect(() => {
    if (count <= 1) return;

    const timer = window.setInterval(() => {
      goNext();
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [count, goNext]);

  return (
    <div className="relative pointer-events-none">
      <div
        ref={viewportRef}
        className="overflow-hidden py-2 md:py-8"
        role="region"
        aria-roledescription="carousel"
        aria-label="Depoimentos de clientes"
      >
        <div
          ref={trackRef}
          className="flex items-stretch will-change-transform"
        >
          {slides.map((testimonial, slideIndex) => {
            const isActive = slideIndex === activeIndex;
            const realIndex = slideIndex % count;

            return (
              <div
                key={`${realIndex}-${slideIndex}`}
                ref={(el) => {
                  cardsRef.current[slideIndex] = el;
                }}
                className="box-border shrink-0 grow-0 px-3 md:px-4"
                style={{
                  width: slideWidth > 0 ? slideWidth : `${100 / itemsPerView}%`,
                  // Initialize --t for SSR / first paint
                  "--t": slideIndex === count ? "1" : "0",
                } as React.CSSProperties}
                aria-hidden={!isActive}
              >
                <article
                  className="relative flex h-full min-h-[260px] md:min-h-[300px] flex-col justify-between overflow-hidden rounded-[1.75rem] p-5 md:p-8 bg-white shadow-md border border-gray-100 will-change-transform"
                  style={{
                    // Scale: 0.975 to 1.0 on desktop, always 1.0 on mobile
                    transform: itemsPerView === 3 
                      ? "scale(calc(0.975 + 0.025 * var(--t)))" 
                      : "scale(1)",
                    // Shadow halo
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1), 0 20px 25px -5px color-mix(in srgb, var(--color-gold) calc(var(--t) * 28%), transparent)",
                    zIndex: `calc(var(--t) * 10)`,
                  }}
                >
                  {/* Gold gradient overlay */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-[#DCBB55] to-[#C09A2C] pointer-events-none"
                    style={{ opacity: "var(--t)" }}
                  />

                  <div
                    className="pointer-events-none absolute top-7 right-7"
                    style={{
                      color:
                        "color-mix(in srgb, color-mix(in srgb, var(--color-white) 30%, transparent) calc(var(--t) * 100%), color-mix(in srgb, var(--color-gold) 20%, transparent))",
                    }}
                    aria-hidden="true"
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                    </svg>
                  </div>

                  <div className="relative z-10 space-y-4 md:space-y-5">
                    <div className="flex gap-1" aria-label="5 de 5 estrelas">
                      {Array.from({ length: 5 }, (_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={16}
                          style={{
                            color: "color-mix(in srgb, var(--color-white) calc(var(--t) * 100%), var(--color-gold))",
                            fill: "currentColor"
                          }}
                        />
                      ))}
                    </div>

                    <p
                      className="text-base md:text-lg leading-relaxed italic"
                      style={{
                        color: "color-mix(in srgb, #FFFFFF calc(var(--t) * 100%), #4B5563)"
                      }}
                    >
                      &quot;{testimonial.text}&quot;
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 flex items-center gap-4 md:mt-8">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-mitram-gold/20 ring-2 ring-white/40">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                        style={{
                          filter: "grayscale(calc(1 - var(--t)))"
                        }}
                        draggable={false}
                      />
                    </div>
                    <div>
                      <p
                        className="font-bold"
                        style={{
                          color: "color-mix(in srgb, var(--color-white) calc(var(--t) * 100%), var(--color-dark))"
                        }}
                      >
                        {testimonial.author}
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          color: "color-mix(in srgb, #FFF6D0 calc(var(--t) * 100%), var(--color-gold))"
                        }}
                      >
                        {testimonial.type}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
