import cloudinaryImageMap from '../src/data/cloudinary-image-map.json';

const imageMap = cloudinaryImageMap as Record<string, string>;
const CLOUDINARY_UPLOAD_PATTERN = /\/(image|video)\/upload\/(?:[^/]+\/)?(v\d+\/.+)$/;

type CloudinaryOptions = {
  width?: number;
  quality?: string;
  format?: string;
  crop?: 'limit' | 'fill' | 'fit' | 'scale';
  gravity?: 'auto' | 'center';
  resourceType?: 'image' | 'video';
};

const defaultWidths = [360, 540, 720, 960, 1280, 1600];

const candidatesFor = (localPath: string) => {
  const normalized = localPath.replaceAll('\\', '/').replace(/^\.\//, '');
  const withoutLeadingSlash = normalized.replace(/^\//, '');

  return [
    normalized,
    withoutLeadingSlash,
    normalized.startsWith('/media/') ? `public${normalized}` : '',
    normalized.startsWith('/videos/') ? `public${normalized}` : '',
  ].filter(Boolean);
};

const isCloudinaryUrl = (url: string) => url.includes('res.cloudinary.com') && url.includes('/upload/');

export const optimizeCloudinaryUrl = (url: string, options: CloudinaryOptions = {}) => {
  if (!isCloudinaryUrl(url)) return url;

  const match = url.match(CLOUDINARY_UPLOAD_PATTERN);
  if (!match) return url;

  const resourceType = options.resourceType || (match[1] as 'image' | 'video');
  const crop = options.crop || 'limit';
  const quality = options.quality || 'auto';
  const format = options.format || 'auto';
  const transforms = [
    `f_${format}`,
    `q_${quality}`,
    resourceType === 'video' ? 'vc_auto' : null,
    options.width ? `c_${crop},w_${options.width}` : null,
    options.gravity ? `g_${options.gravity}` : null,
  ].filter(Boolean).join(',');

  return url.replace(CLOUDINARY_UPLOAD_PATTERN, `/${resourceType}/upload/${transforms}/$2`);
};

export const getImageUrl = (localPath: string, fallbackOrOptions: string | CloudinaryOptions = localPath, maybeOptions: CloudinaryOptions = {}) => {
  const fallback = typeof fallbackOrOptions === 'string' ? fallbackOrOptions : localPath;
  const options = typeof fallbackOrOptions === 'string' ? maybeOptions : fallbackOrOptions;

  for (const candidate of candidatesFor(localPath)) {
    if (imageMap[candidate]) return optimizeCloudinaryUrl(imageMap[candidate], options);
  }

  return optimizeCloudinaryUrl(fallback, options);
};

export const getImageSrcSet = (localPath: string, widths = defaultWidths) => {
  const baseUrl = getImageUrl(localPath);
  if (!isCloudinaryUrl(baseUrl)) return undefined;
  return widths.map((width) => `${optimizeCloudinaryUrl(baseUrl, { width })} ${width}w`).join(', ');
};

export const getVideoUrl = (localPath: string, width = 1600) => (
  getImageUrl(localPath, { resourceType: 'video', width, quality: 'auto' })
);
