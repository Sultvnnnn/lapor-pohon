"use client";

import { useRef, useState } from "react";

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label?: string;
};

type Props = {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
  personBoxes?: BoundingBox[];
  alt?: string;
};

const getBoxStyle = (box: BoundingBox) => {
  if (box.label === "person") {
    return {
      border: "border-cyan-400 border-2 shadow-sm",
      bg: "bg-cyan-600 text-white font-bold",
      label: `🧍 Kalibrasi Manusia (${Math.round(box.confidence * 100)}%)`,
    };
  }

  if (box.confidence >= 0.7) {
    return {
      border: "border-green-500 border-2",
      bg: "bg-green-600 text-white font-bold",
      label: `🌲 Pohon ${Math.round(box.confidence * 100)}%`,
    };
  }
  if (box.confidence >= 0.4) {
    return {
      border: "border-yellow-500 border-2",
      bg: "bg-amber-500 text-black font-bold",
      label: `🌲 Pohon ${Math.round(box.confidence * 100)}%`,
    };
  }
  return {
    border: "border-red-500 border-2",
    bg: "bg-red-600 text-white font-bold",
    label: `🌲 Pohon ${Math.round(box.confidence * 100)}%`,
  };
};

export const TreeImageWithBoundingBox = ({
  imageUrl,
  boundingBoxes = [],
  personBoxes = [],
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

  // Combine boundingBoxes and personBoxes if personBoxes is passed separately
  const allBoxes: BoundingBox[] = [
    ...boundingBoxes.map((b) => ({ ...b, label: b.label || "tree" })),
    ...personBoxes
      .filter((pb) => typeof pb.x === "number" && typeof pb.y === "number")
      .map((pb) => ({ ...pb, label: "person" })),
  ];

  return (
    <div className="relative inline-block w-full overflow-hidden rounded-2xl">
      <img
        ref={imgRef}
        src={imageUrl}
        alt={alt ?? "Foto pohon"}
        onLoad={handleImageLoad}
        className="block w-full h-auto rounded-2xl object-cover"
      />

      {renderedSize.width > 0 &&
        allBoxes.map((box, idx) => {
          const style = getBoxStyle(box);
          return (
            <div
              key={idx}
              className={`absolute ${style.border} transition-all pointer-events-none rounded-sm`}
              style={{
                left: `${box.x * 100}%`,
                top: `${box.y * 100}%`,
                width: `${box.width * 100}%`,
                height: `${box.height * 100}%`,
              }}
            >
              <span
                className={`absolute -top-6 left-0 ${style.bg} text-[10px] px-2 py-0.5 rounded-full shadow-md whitespace-nowrap tracking-wider`}
              >
                {style.label}
              </span>
            </div>
          );
        })}
    </div>
  );
};
