'use client';
import React from 'react';
import Image from 'next/image';
import { useGalleryStore } from './hooks/useGalleryStore';

const ThumbnailStrip = () => {
  const { images, currentIndex, setCurrentIndex } = useGalleryStore();

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
      <div className="flex space-x-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-20 h-20 relative flex-shrink-0 ${
              index === currentIndex ? 'border-2 border-white' : ''
            }`}
          >
            <Image
              src={image.thumbnail}
              alt={image.alt}
              layout="fill"
              objectFit="cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThumbnailStrip;