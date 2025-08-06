import React from 'react';
import { useGalleryStore } from './hooks/useGalleryStore';

const DownloadButton = () => {
  const { images, currentIndex } = useGalleryStore();

  const handleDownload = () => {
    const image = images[currentIndex];
    const link = document.createElement('a');
    link.href = image.src;
    link.download = image.alt || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="absolute top-4 left-20 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md"
    >
      Download
    </button>
  );
};

export default DownloadButton;