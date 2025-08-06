import React from 'react';
import { useGalleryStore } from './hooks/useGalleryStore';

const ImageCounter = () => {
  const { currentIndex, images } = useGalleryStore();

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md">
      {currentIndex + 1} / {images.length}
    </div>
  );
};

export default ImageCounter;