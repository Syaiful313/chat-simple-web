"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageMessageProps {
  src: string;
  alt?: string;
}

export function ImageMessage({ src, alt = "Image" }: ImageMessageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
      {/* Thumbnail */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className="cursor-pointer group relative max-w-sm overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <Image
          src={src}
          alt={alt}
          width={400}
          height={300}
          className="max-h-64 w-auto object-cover transition-opacity group-hover:opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
            Click to view
          </span>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-50"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full h-full max-w-4xl max-h-[85vh]">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
