"use client";

import { useEffect, useState } from "react";

export function useSectionNavigation(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const observers = new Map();
    let timeoutId: NodeJS.Timeout;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setActiveSection(entry.target.id);
          }, 100);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0.1,
    });

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        observers.set(id, element);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [sectionIds]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return { activeSection, scrollToSection };
}
