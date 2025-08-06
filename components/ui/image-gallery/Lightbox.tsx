'use client';
import React from 'react';
import { useGalleryStore } from './hooks/useGalleryStore';
import Carousel from './Carousel';
import ImageCounter from './ImageCounter';
import ShareButton from './ShareButton';
import DownloadButton from './DownloadButton';
import GestureHint from './GestureHint';
import ThumbnailStrip from './ThumbnailStrip';

const Lightbox = () => {
  const { isLightboxOpen, closeLightbox } = useGalleryStore();

  if (!isLightboxOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={closeLightbox}
    >
      <div
        className="relative w-full h-full max-w-4xl max-h-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Carousel />
        <ImageCounter />
        <ShareButton />
        <DownloadButton />
        <GestureHint />
        <ThumbnailStrip />
        <button
          onClick={closeLightbox}
          className="absolute top-4 right-14 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Lightbox;