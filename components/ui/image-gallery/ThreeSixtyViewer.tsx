'use client';
import React from 'react';
import { Pannellum } from 'pannellum-react';
import { useGalleryStore } from './hooks/useGalleryStore';

const ThreeSixtyViewer = () => {
  const { images, currentIndex } = useGalleryStore();
  const image = images[currentIndex];

  if (!image || !image.is360) return null;

  return (
    <Pannellum
      width="100%"
      height="100%"
      image={image.src}
      pitch={10}
      yaw={180}
      hfov={110}
      autoLoad
      showZoomCtrl={false}
      onLoad={() => {
        console.log('panorama loaded');
      }}
    >
      <Pannellum.Hotspot
        type="custom"
        pitch={31}
        yaw={150}
        handleClick={(evt, name) => console.log(name)}
        name="hs1"
      />
    </Pannellum>
  );
};

export default ThreeSixtyViewer;