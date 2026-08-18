import { supabase } from '@/integrations/supabase/client';
import { prepareImageVariants } from '@/utils/imageCompression';

export const ALLOWED_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_SOURCE_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 25 * 1024 * 1024;
export const MAX_CARD_MEDIA = 6;
export const MAX_GALLERY_IMAGES = 16;

interface R2Object {
  variant: 'full' | 'sm';
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

interface R2PresignResponse {
  publicUrl?: string;
  contentType?: string;
  cacheControl?: string;
  objects?: R2Object[];
  error?: string;
}

async function functionErrorMessage(error: unknown): Promise<string> {
  if (error && typeof error === 'object' && 'context' in error) {
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      try {
        const body = await context.clone().json();
        if (body?.error) return String(body.error);
      } catch {
        // fall through
      }
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message);
  }
  return 'R2 request failed';
}

function assertAllowedFile(file: File, stage: 'source' | 'upload' = 'source') {
  const contentType = (file.type || '').toLowerCase();
  if (!ALLOWED_MEDIA_TYPES.has(contentType)) {
    throw new Error('نوع الملف غير مدعوم. استخدم JPEG أو PNG أو WebP أو MP4');
  }
  const imageLimit = stage === 'source' ? MAX_SOURCE_IMAGE_BYTES : MAX_IMAGE_BYTES;
  const limit = contentType.startsWith('video/') ? MAX_VIDEO_BYTES : imageLimit;
  if (file.size > limit) {
    const mb = Math.round(limit / (1024 * 1024));
    throw new Error(`حجم الملف أكبر من ${mb}MB`);
  }
  return contentType;
}

async function putObject(file: File, object: R2Object, contentType: string, cacheControl: string) {
  const putResponse = await fetch(object.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
    },
    body: file,
  });

  if (!putResponse.ok) {
    const details = await putResponse.text().catch(() => '');
    throw new Error(details || `R2 upload failed with status ${putResponse.status}`);
  }
}

export const uploadMediaToR2 = async (file: File): Promise<string> => {
  assertAllowedFile(file, 'source');

  const { full, thumb } = await prepareImageVariants(file);
  const contentType = (full.type || file.type).toLowerCase();
  assertAllowedFile(full, 'upload');

  const { data, error } = await supabase.functions.invoke<R2PresignResponse>('r2-presign', {
    body: {
      contentType,
      fileName: full.name,
      contentLength: full.size,
      includeThumb: Boolean(thumb),
    },
  });

  if (error) throw new Error(await functionErrorMessage(error));
  if (!data?.objects?.length || !data.contentType || !data.cacheControl) {
    throw new Error(data?.error || 'Failed to create R2 upload URL');
  }

  const fullObject = data.objects.find((item) => item.variant === 'full');
  const thumbObject = data.objects.find((item) => item.variant === 'sm');
  if (!fullObject) throw new Error('Missing R2 upload target');

  await putObject(full, fullObject, data.contentType, data.cacheControl);
  if (thumb && thumbObject) {
    await putObject(thumb, thumbObject, data.contentType, data.cacheControl);
  }

  return data.publicUrl || fullObject.publicUrl;
};

export const deleteMediaFromR2 = async (urls: string[]): Promise<void> => {
  const unique = [...new Set(urls.filter(Boolean))];
  if (unique.length === 0) return;

  const { error } = await supabase.functions.invoke('r2-delete', {
    body: { urls: unique },
  });

  if (error) {
    console.error('Failed to delete R2 media:', await functionErrorMessage(error));
  }
};
