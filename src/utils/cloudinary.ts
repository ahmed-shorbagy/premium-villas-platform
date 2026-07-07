/**
 * Cloudinary Upload Utility
 * Handles uploading files directly to Cloudinary via REST API using unsigned presets.
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.warn("Cloudinary configuration is missing in environment variables.");
}

/**
 * Uploads a file (image or video) to Cloudinary and returns the secure URL.
 * It automatically applies f_auto and q_auto to the URL if it's an image.
 *
 * @param file The file to upload (Image or Video)
 * @returns The optimized secure URL of the uploaded asset
 */
export const uploadMediaToCloudinary = async (file: File): Promise<string> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing.");
  }

  // Use 'auto' resource type to handle both images and videos
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error:", errorData);
      throw new Error(errorData.error?.message || "Failed to upload to Cloudinary");
    }

    const data = await response.json();
    let secureUrl = data.secure_url;

    // Apply auto format (f_auto) and auto quality (q_auto) if it's an image
    // Cloudinary video transformation is different, usually handled at upload time or specifically
    if (data.resource_type === "image") {
      // Inject /upload/f_auto,q_auto/ into the URL
      const parts = secureUrl.split("/upload/");
      if (parts.length === 2) {
        secureUrl = `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
      }
    } else if (data.resource_type === "video") {
      // For videos, q_auto helps, f_auto works for specific formats, let's inject q_auto
      const parts = secureUrl.split("/upload/");
      if (parts.length === 2) {
        secureUrl = `${parts[0]}/upload/q_auto/${parts[1]}`;
      }
    }

    return secureUrl;
  } catch (error) {
    console.error("Error in uploadMediaToCloudinary:", error);
    throw error;
  }
};
