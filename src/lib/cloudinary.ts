/**
 * Utilities for working with Cloudinary.  The Appwrite free plan stores
 * only a `publicId` for each media item.  URLs are generated on the fly
 * from the publicId and the configured cloud name.
 */
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Generate a Cloudinary URL for a given publicId.  You can optionally
 * specify width, height and crop mode.  See Cloudinary docs for details.
 */
export function getCloudinaryImageUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: 'fill' | 'fit' | 'thumb' | 'scale'; format?: string } = {}
): string {
  if (!cloudName) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME env var');
  }
  const { width, height, crop = 'fill', format = 'auto' } = options;
  // Build transformation string
  const transforms: string[] = [];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  transforms.push(`f_${format}`);
  const transformString = transforms.join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

/**
 * Generate a Cloudinary video URL.  Use this if you support video
 * attachments in messages or posts.
 */
export function getCloudinaryVideoUrl(publicId: string): string {
  if (!cloudName) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME env var');
  }
  return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`;
}