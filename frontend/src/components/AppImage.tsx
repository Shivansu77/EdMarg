'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { getImageUrl } from '@/utils/imageUrl';

type AppImageProps = ImageProps & {
  unoptimized?: boolean;
  fallbackName?: string;
};

const AppImage = ({ unoptimized = true, fallbackName, src, ...props }: AppImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Reset state if src changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      unoptimized={unoptimized}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(getImageUrl('', fallbackName));
        }
      }}
    />
  );
};

export default AppImage;
