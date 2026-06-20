import React from 'react';
import { getImageSrcSet, getImageUrl } from '../../utils/images';

type OptimizedImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'loading'> & {
  src: string;
  width?: number;
  widths?: number[];
  sizes?: string;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  width = 960,
  widths,
  sizes = '100vw',
  loading = 'lazy',
  priority = false,
  ...props
}) => (
  <img
    {...props}
    src={getImageUrl(src, { width })}
    srcSet={getImageSrcSet(src, widths)}
    sizes={sizes}
    loading={priority ? 'eager' : loading}
    fetchPriority={priority ? 'high' : 'auto'}
  />
);
