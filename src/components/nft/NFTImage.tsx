import React from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

interface NFTImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const NFTImage: React.FC<NFTImageProps> = React.memo(({ src, alt, className }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  return (
    <Card className={`overflow-hidden ${className}`}>
      {isLoading && <Skeleton className="w-full aspect-square" />}
      <img 
        src={src} 
        alt={alt}
        className={`w-full h-auto object-cover rounded-lg ${isLoading ? 'hidden' : ''}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
      />
      {error && (
        <div className="w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <span className="text-gray-500">Failed to load image</span>
        </div>
      )}
    </Card>
  );
});

NFTImage.displayName = 'NFTImage';