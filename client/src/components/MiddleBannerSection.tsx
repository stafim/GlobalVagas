import { useQuery } from "@tanstack/react-query";
import type { Banner } from "@shared/schema";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MiddleBannerSection() {
  const { data: banners } = useQuery<Banner[]>({
    queryKey: ['/api/banners/active', { position: 'meio' }],
    retry: false,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

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

        <div className="relative group">
          <a
            href={getBannerLink(currentBanner.linkUrl)}
            target={currentBanner.linkUrl ? '_blank' : undefined}
            rel={currentBanner.linkUrl ? 'noopener noreferrer' : undefined}
            className="block relative overflow-hidden rounded-xl border border-border bg-muted/30 hover:border-primary/50 transition-all duration-300"
            data-testid={`middle-banner-ad-${currentBanner.id}`}
          >
            {currentBanner.imageUrl ? (
              <div className="relative w-full">
                <img
                  src={currentBanner.imageUrl.startsWith('/attached_assets/') ? currentBanner.imageUrl : (currentBanner.imageUrl.startsWith('/objects') ? currentBanner.imageUrl : `/objects${currentBanner.imageUrl}`)}
                  alt={currentBanner.title}
                  className="w-full h-auto max-h-96 object-cover"
                  data-testid="middle-banner-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">{currentBanner.title}</h2>
                  {currentBanner.subtitle && (
                    <p className="text-lg opacity-90">{currentBanner.subtitle}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
                <h2 className="text-3xl font-bold mb-2">{currentBanner.title}</h2>
                {currentBanner.subtitle && (
                  <p className="text-lg text-muted-foreground">{currentBanner.subtitle}</p>
                )}
              </div>
            )}
          </a>

          {banners.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToPrev}
                data-testid="middle-banner-prev"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={goToNext}
                data-testid="middle-banner-next"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {banners.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
                }`}
                onClick={() => setCurrentIndex(index)}
                data-testid={`middle-banner-indicator-${index}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
