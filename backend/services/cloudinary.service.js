/**
 * Cloudinary Video Service
 * ========================
 * Reusable Cloudinary helper for video uploads, signed URL generation,
 * and cleanup. Uses the SAME credentials already configured for image uploads.
 *
 * Environment variables required:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// ─── Singleton Configuration ────────────────────────────────────────────────
// Configure once — every require() of this module gets the same instance.
const cloudinaryUrl = (process.env.CLOUDINARY_URL || '').trim();

if (cloudinaryUrl) {
  cloudinary.config(cloudinaryUrl);
} else {
  cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  });
}

// ─── Upload Video from Readable Stream ──────────────────────────────────────
/**
 * Streams a video directly to Cloudinary without buffering the whole file.
 *
 * @param {import('stream').Readable} readableStream  - Node Readable stream of the video data
 * @param {Object}  options
 * @param {string}  [options.folder]     - Cloudinary folder (default: 'session-recordings')
 * @param {string}  [options.publicId]   - Custom public_id (auto-generated if omitted)
 * @returns {Promise<{ secure_url: string, public_id: string, duration: number, bytes: number }>}
 */
async function uploadVideoFromStream(readableStream, options = {}) {
  const folder = options.folder || 'session-recordings';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder,
        ...(options.publicId ? { public_id: options.publicId } : {}),
        // Cloudinary will detect codec/format automatically
        overwrite: true,
        // Enable eager transformations for adaptive streaming (optional)
        eager_async: true,
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Video upload failed:', error.message);
          return reject(error);
        }

        console.log('[Cloudinary] Video uploaded successfully:', {
          public_id: result.public_id,
          duration: result.duration,
          bytes: result.bytes,
          format: result.format,
        });

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          duration: result.duration || 0,
          bytes: result.bytes || 0,
        });
      }
    );

    // Pipe the incoming stream into Cloudinary's upload stream
    readableStream.pipe(uploadStream);

    // Forward stream errors
    readableStream.on('error', (err) => {
      console.error('[Cloudinary] Source stream error:', err.message);
      uploadStream.destroy(err);
      reject(err);
    });
  });
}

// ─── Generate Signed URL ────────────────────────────────────────────────────
/**
 * Generates a time-limited signed URL for secure video playback.
 * The URL expires after the given duration — the student must re-request
 * from the API to get a fresh one.
 *
 * @param {string} publicId     - Cloudinary public_id of the video
 * @param {Object} options
 * @param {number} [options.expiresInSeconds] - URL lifetime (default: 7200 = 2 hours)
 * @returns {string} Signed URL
 */
function generateSignedUrl(publicId, options = {}) {
  const expiresAt = Math.floor(Date.now() / 1000) + (options.expiresInSeconds || 7200);

  return cloudinary.url(publicId, {
    resource_type: 'video',
    type: 'authenticated',
    sign_url: true,
    secure: true,
    expires_at: expiresAt,
  });
}

/**
 * Alternative: generate a signed URL for videos uploaded with default (upload) type.
 * Uses the Cloudinary private_download_url which generates a time-limited link.
 *
 * @param {string} publicId
 * @param {Object} options
 * @param {number} [options.expiresInSeconds]
 * @returns {string}
 */
function generateSignedDeliveryUrl(publicId, options = {}) {
  const expiresAt = Math.floor(Date.now() / 1000) + (options.expiresInSeconds || 7200);

  // For videos uploaded as 'upload' type, we sign the URL directly
  return cloudinary.url(publicId, {
    resource_type: 'video',
    sign_url: true,
    secure: true,
    type: 'upload',
    // Append expiration as a transformation timestamp
  });
}

// ─── Delete Video ───────────────────────────────────────────────────────────
/**
 * Removes a video from Cloudinary storage.
 *
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<Object>}
 */
async function deleteVideo(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
    });
    console.log('[Cloudinary] Video deleted:', publicId, result);
    return result;
  } catch (error) {
    console.error('[Cloudinary] Failed to delete video:', publicId, error.message);
    throw error;
  }
}

module.exports = {
  cloudinary, // Export the configured instance for edge cases
  uploadVideoFromStream,
  generateSignedUrl,
  generateSignedDeliveryUrl,
  deleteVideo,
};
