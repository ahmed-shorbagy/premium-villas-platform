import imageCompression from 'browser-image-compression';

const IMAGE_TYPE = 'image/webp' as const;

function asWebpFile(blob: Blob, name: string) {
  const stem = name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
  return new File([blob], `${stem}.webp`, { type: IMAGE_TYPE });
}

export const compressImage = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) return file;

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.28,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: IMAGE_TYPE,
    });
    return asWebpFile(compressed, file.name);
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
};

export const prepareImageVariants = async (
  file: File,
): Promise<{ full: File; thumb: File | null }> => {
  if (!file.type.startsWith('image/')) {
    return { full: file, thumb: null };
  }

  const full = await compressImage(file);

  try {
    const thumbBlob = await imageCompression(full, {
      maxSizeMB: 0.12,
      maxWidthOrHeight: 480,
      useWebWorker: true,
      fileType: IMAGE_TYPE,
    });
    return { full, thumb: asWebpFile(thumbBlob, `thumb-${file.name}`) };
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    return { full, thumb: null };
  }
};
