import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
  // If the file is not an image (e.g. video), return it as-is
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const options = {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp' as const, // Force WebP for best compression
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // browser-image-compression returns a Blob sometimes, or a File with .jpg extension but webp type.
    // Let's ensure it has the correct name and extension so Supabase saves it properly.
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const newName = `${nameWithoutExt}.webp`;
    
    return new File([compressedFile], newName, {
      type: 'image/webp',
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    // Fallback to original file if compression fails
    return file;
  }
};
