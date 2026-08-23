import { useEffect, useState } from 'react';
import { mediaUrl } from '@/utils/media';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'full';
  className?: string;
  priority?: boolean;
}

const OptimizedImage = ({
  src,
  alt,
  size = 'full',
  className,
  priority = false,
}: OptimizedImageProps) => {
  const preferred = mediaUrl(src, size);
  const [currentSrc, setCurrentSrc] = useState(preferred);

  useEffect(() => {
    setCurrentSrc(mediaUrl(src, size));
  }, [src, size]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn(className)}
      onError={() => {
        if (currentSrc !== src) setCurrentSrc(src);
      }}
    />
  );
};

export default OptimizedImage;
