import React from 'react';
import { useGalleryStore } from './hooks/useGalleryStore';

const ShareButton = () => {
  const { images, currentIndex } = useGalleryStore();

  const handleShare = async () => {
    const image = images[currentIndex];
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this image!',
          text: image.alt,
          url: image.src,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert('Web Share API is not supported in your browser.');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md"
    >
      Share
    </button>
  );
};

export default ShareButton;