import { useQuery } from "@tanstack/react-query";
import type { Banner } from "@shared/schema";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CategorySection() {
  const { data: banners } = useQuery<Banner[]>({
    queryKey: ['/api/banners/active'],
    retry: false,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const getBannerLink = (linkUrl: string | null | undefined) => {
    if (!linkUrl) return '#';
    
    if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
      return linkUrl;
    }
    
    return `https://${linkUrl}`;
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Ad Label */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Publicidade
          </span>
          {banners.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {banners.length}
              </span>
            </div>
          )}
        </div>

        {/* Banner Container */}
        <div className="relative group">
          {/* Main Banner */}
          <a
            href={getBannerLink(currentBanner.linkUrl)}
            target={currentBanner.linkUrl ? '_blank' : undefined}
            rel={currentBanner.linkUrl ? 'noopener noreferrer' : undefined}
            className="block relative overflow-hidden rounded-xl border border-border bg-muted/30 hover:border-primary/50 transition-all duration-300"
            data-testid={`banner-ad-${currentBanner.id}`}
          >
            {currentBanner.imageUrl ? (
              <div className="relative w-full">
                <img
                  src={currentBanner.imageUrl.startsWith('attached_assets') ? `/${currentBanner.imageUrl}` : (currentBanner.imageUrl.startsWith('/objects') ? currentBanner.imageUrl : `/objects${currentBanner.imageUrl}`)}
                  alt={currentBanner.title}
                  className="w-full h-auto max-h-[350px] object-cover"
                />
                
                {/* Optional Text Overlay (if title/subtitle are set) */}
                {(currentBanner.title || currentBanner.subtitle) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    {currentBanner.title && (
                      <h3 className="text-white font-bold text-2xl mb-1">
                        {currentBanner.title}
                      </h3>
                    )}
                    {currentBanner.subtitle && (
                      <p className="text-white/90 text-base">
                        {currentBanner.subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Fallback if no image
              <div className="flex flex-col items-center justify-center min-h-[250px] p-12 text-center">
                <h3 className="text-3xl font-bold mb-3">{currentBanner.title}</h3>
                {currentBanner.subtitle && (
                  <p className="text-xl text-muted-foreground max-w-2xl">
                    {currentBanner.subtitle}
                  </p>
                )}
              </div>
            )}
          </a>

          {/* Navigation Arrows (only show if multiple banners) */}
          {banners.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  goToPrev();
                }}
                data-testid="banner-prev"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  goToNext();
                }}
                data-testid="banner-next"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  data-testid={`banner-dot-${index}`}
                  aria-label={`Ir para banner ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
