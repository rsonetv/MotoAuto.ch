"use client";

import React from "react";
import ReactImageTurntable from "react-image-turntable";

interface Vehicle360ViewProps {
  images: string[];
}

const Vehicle360View: React.FC<Vehicle360ViewProps> = ({ images }) => {
  if (!images || images.length === 0) {
    return <div>Brak obrazów 360°</div>;
  }

  return (
    <div className="w-full">
      <ReactImageTurntable images={images} />
    </div>
  );
};

export default Vehicle360View;