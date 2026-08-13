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

const getBoxStyle = (confidence: number) => {
  if (confidence >= 0.7) {
    return {
      border: "border-green-500",
      bg: "bg-green-500",
    };
  }
  if (confidence >= 0.4) {
    return {
      border: "border-yellow-500",
      bg: "bg-yellow-500",
    };
  }
  return {
    border: "border-red-500",
    bg: "bg-red-500",
  };
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
        boundingBoxes.map((box, idx) => {
          const style = getBoxStyle(box.confidence);
          return (
            <div
              key={idx}
              className={`absolute border-2 ${style.border}`}
              style={{
                left: box.x * renderedSize.width,
                top: box.y * renderedSize.height,
                width: box.width * renderedSize.width,
                height: box.height * renderedSize.height,
              }}
            >
              <span
                className={`absolute -top-6 left-0 ${style.bg} text-white text-xs px-1 rounded whitespace-nowrap`}
              >
                {Math.round(box.confidence * 100)}%
              </span>
            </div>
          );
        })}
    </div>
  );
};
