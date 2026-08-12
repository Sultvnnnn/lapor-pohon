"use client";

import { useRef, useState } from "react";

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
};

type Props = {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
  alt?: string;
};

export const TreeImageWithBoundingBox = ({
  imageUrl,
  boundingBoxes,
  alt,
}: Props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [renderedSize, setRenderedSize] = useState({ width: 0, height: 0 });

  const handleImageLoad = () => {
    if (imgRef.current) {
      setRenderedSize({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
    }
  };

  return (
    <div className="relative inline-block">
      <img
        ref={imgRef}
        src={imageUrl}
        alt={alt ?? "Foto pohon"}
        onLoad={handleImageLoad}
        className="block w-full h-auto rounded"
      />

      {renderedSize.width > 0 &&
        boundingBoxes.map((box, idx) => (
          <div
            key={idx}
            className="absolute border-2 border-red-500"
            style={{
              left: box.x * renderedSize.width,
              top: box.y * renderedSize.height,
              width: box.width * renderedSize.width,
              height: box.height * renderedSize.height,
            }}
          >
            <span className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded whitespace-nowrap">
              {Math.round(box.confidence * 100)}%
            </span>
          </div>
        ))}
    </div>
  );
};
