'use client';
import React, { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useGalleryStore } from './hooks/useGalleryStore';
import ZoomableImage from './ZoomableImage';
import dynamic from 'next/dynamic';

const ThreeSixtyViewer = dynamic(() => import('./ThreeSixtyViewer'), {
  ssr: false,
});

const Carousel = () => {
  const { images, currentIndex, setCurrentIndex } = useGalleryStore();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setCurrentIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi, setCurrentIndex]);

  useEffect(() => {
    if (emblaApi && emblaApi.selectedScrollSnap() !== currentIndex) {
      emblaApi.scrollTo(currentIndex);
    }
  }, [currentIndex, emblaApi]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {images.map((image, index) => (
          <div className="flex-[0_0_100%] relative h-full" key={index}>
            {image.is360 ? (
              <ThreeSixtyViewer />
            ) : (
              <ZoomableImage
                src={image.src}
                alt={image.alt}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;