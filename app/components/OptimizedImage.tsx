'use client';
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
}

export default function OptimizedImage({ 
  src, 
  fallbackSrc, 
  alt, 
  ...props 
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'loading 1.5s infinite',
            zIndex: 1,
          }}
        />
      )}
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (fallbackSrc && imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
          }
          setIsLoading(false);
        }}
        style={{
          ...props.style,
          transition: 'opacity 0.3s ease',
          opacity: isLoading ? 0 : 1,
        }}
      />
      <style jsx>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}