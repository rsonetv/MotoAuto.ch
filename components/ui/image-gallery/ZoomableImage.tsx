'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { useDrag } from '@use-gesture/react';
import { useGalleryStore } from './hooks/useGalleryStore';

interface ZoomableImageProps {
  src: string;
  alt: string;
  placeholder: 'blur' | 'empty';
  blurDataURL?: string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, ...props }) => {
  const { zoomLevel, setZoomLevel } = useGalleryStore();
  const targetRef = useRef<HTMLDivElement>(null);

  useDrag(
    ({ pinching, tap, args: [initialZoom] }) => {
      if (pinching) {
        // Pinch-to-zoom logic would go here.
        // This is a simplified example.
      }
      if (tap) {
        setZoomLevel(zoomLevel > 1 ? 1 : 2);
      }
    },
    { target: targetRef }
  );

  return (
    <div ref={targetRef} style={{ touchAction: 'none', transform: `scale(${zoomLevel})`, transition: 'transform 0.2s' }}>
      <Image src={src} alt={alt} layout="fill" objectFit="contain" {...props} />
    </div>
  );
};

export default ZoomableImage;