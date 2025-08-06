'use client';
import React, { useEffect } from 'react';
import { useGalleryStore } from './hooks/useGalleryStore';
import Lightbox from './Lightbox';
import Image from 'next/image';

interface Image {
  src: string;
  alt: string;
  thumbnail: string;
  is360: boolean;
}

interface ImageGalleryProps {
  images: Image[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const { setImages, openLightbox } = useGalleryStore();

  useEffect(() => {
    setImages(images);
  }, [images, setImages]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button key={index} onClick={() => openLightbox(index)}>
            <Image
              src={image.thumbnail}
              alt={image.alt}
              width={300}
              height={200}
              className="object-cover"
            />
          </button>
        ))}
      </div>
      <Lightbox />
    </div>
  );
};

export default ImageGallery;