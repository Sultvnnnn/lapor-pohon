"use client";

import { useRef, useState, useEffect } from "react";

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
  className?: string;
  imgClassName?: string;
  isLightbox?: boolean;
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
      border: "border-green-500 border-2 shadow-sm",
      bg: "bg-green-600 text-white font-bold",
      label: `🌲 Pohon ${Math.round(box.confidence * 100)}%`,
    };
  }
  if (box.confidence >= 0.4) {
    return {
      border: "border-yellow-500 border-2 shadow-sm",
      bg: "bg-amber-500 text-black font-bold",
      label: `🌲 Pohon ${Math.round(box.confidence * 100)}%`,
    };
  }
  return {
    border: "border-red-500 border-2 shadow-sm",
    bg: "bg-red-600 text-white font-bold",
    label: `🌲 Pohon ${Math.round(box.confidence * 100)}%`,
  };
};

export const TreeImageWithBoundingBox = ({
  imageUrl,
  boundingBoxes = [],
  personBoxes = [],
  alt,
  className,
  imgClassName,
  isLightbox = false,
}: Props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [imageUrl]);

  let safeBoxes: BoundingBox[] = [];
  if (Array.isArray(boundingBoxes)) {
    safeBoxes = boundingBoxes;
  } else if (typeof boundingBoxes === "string") {
    try {
      const parsed = JSON.parse(boundingBoxes);
      if (Array.isArray(parsed)) safeBoxes = parsed;
    } catch (e) {}
  }

  let safePersonBoxes: BoundingBox[] = [];
  if (Array.isArray(personBoxes)) {
    safePersonBoxes = personBoxes;
  } else if (typeof personBoxes === "string") {
    try {
      const parsed = JSON.parse(personBoxes);
      if (Array.isArray(parsed)) safePersonBoxes = parsed;
    } catch (e) {}
  }

  const allBoxes: BoundingBox[] = [
    ...safeBoxes.map((b) => ({ ...b, label: b.label || "tree" })),
    ...safePersonBoxes
      .filter((pb) => typeof pb.x === "number" && typeof pb.y === "number")
      .map((pb) => ({ ...pb, label: "person" })),
  ];

  if (isLightbox) {
    return (
      <div className={className || "relative inline-block max-h-[82vh] max-w-[90vw] rounded-2xl font-sans"}>
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt ?? "Foto pohon"}
          onLoad={handleImageLoad}
          className={imgClassName || "max-h-[82vh] max-w-[90vw] w-auto h-auto block rounded-2xl object-contain shadow-2xl border border-white/15"}
        />

        {allBoxes.map((box, idx) => {
          const style = getBoxStyle(box);
          return (
            <div
              key={idx}
              className={`absolute ${style.border} transition-all pointer-events-none rounded-sm z-10`}
              style={{
                left: `${(box.x || 0) * 100}%`,
                top: `${(box.y || 0) * 100}%`,
                width: `${(box.width || 0) * 100}%`,
                height: `${(box.height || 0) * 100}%`,
              }}
            >
              <span
                className={`absolute -top-5 sm:-top-6 left-0 ${style.bg} text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full shadow-md whitespace-nowrap tracking-wider z-20`}
              >
                {style.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={className || "relative inline-block w-full h-full overflow-hidden rounded-2xl font-sans"}>
      <img
        ref={imgRef}
        src={imageUrl}
        alt={alt ?? "Foto pohon"}
        onLoad={handleImageLoad}
        className={imgClassName || "block w-full h-full rounded-2xl object-cover"}
      />

      {allBoxes.map((box, idx) => {
        const style = getBoxStyle(box);
        return (
          <div
            key={idx}
            className={`absolute ${style.border} transition-all pointer-events-none rounded-sm z-10`}
            style={{
              left: `${(box.x || 0) * 100}%`,
              top: `${(box.y || 0) * 100}%`,
              width: `${(box.width || 0) * 100}%`,
              height: `${(box.height || 0) * 100}%`,
            }}
          >
            <span
              className={`absolute -top-5 sm:-top-6 left-0 ${style.bg} text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full shadow-md whitespace-nowrap tracking-wider z-20`}
            >
              {style.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

