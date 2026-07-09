// @ts-nocheck
/**
 * Cloudinary Video Service
 * ========================
 * Reusable Cloudinary helper for video uploads, signed URL generation,
 * and cleanup. Uses the SAME credentials already configured for image uploads.
 *
 * All video uploads are now compressed via FFmpeg before being sent to
 * Cloudinary (H.264 / AAC / CRF 28 / 1080p cap / faststart).
 *
 * Environment variables required:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const fs = require('fs');
const {
  compressVideoBuffer,
  compressVideoFile,
  compressVideoStream,
  cleanupFile,
} = require('./compression.service');

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

function assertCloudinaryConfigured() {
  const cfg = cloudinary.config();
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    throw new Error(
      'Cloudinary credentials are missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }
}

// ─── Internal: Upload a Readable Stream to Cloudinary ──────────────────────
function _uploadStreamToCloudinary(readableStream, options = {}) {
  assertCloudinaryConfigured();

  const folder = options.folder || 'session-recordings';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder,
        ...(options.publicId ? { public_id: options.publicId } : {}),
        overwrite: true,
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

    readableStream.pipe(uploadStream);

    readableStream.on('error', (err) => {
      console.error('[Cloudinary] Source stream error:', err.message);
      uploadStream.destroy(err);
      reject(err);
    });
  });
}

// ─── Upload Video from Readable Stream (with compression) ──────────────────
/**
 * Compresses and streams a video to Cloudinary.
 *
 * @param {import('stream').Readable} readableStream  - Node Readable stream of the video data
 * @param {Object}  options
 * @param {string}  [options.folder]     - Cloudinary folder (default: 'session-recordings')
 * @param {string}  [options.publicId]   - Custom public_id (auto-generated if omitted)
 * @returns {Promise<{ secure_url: string, public_id: string, duration: number, bytes: number, compressionStats?: object }>}
 */
async function uploadVideoFromStream(readableStream, options = {}) {
  console.log('[Cloudinary] Starting stream upload with compression...');

  // Compress the stream first
  const compressed = await compressVideoStream(readableStream);

  try {
    const result = await _uploadStreamToCloudinary(compressed.stream, options);

    if (compressed.wasCompressed) {
      console.log(
        `[Cloudinary] 📦 Compression saved: ${(compressed.originalSize / 1e6).toFixed(1)} MB → ` +
        `${(compressed.compressedSize / 1e6).toFixed(1)} MB (${compressed.reductionPercent}% reduction)`
      );
    }

    return {
      ...result,
      compressionStats: {
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        reductionPercent: compressed.reductionPercent,
        wasCompressed: compressed.wasCompressed,
      },
    };
  } finally {
    // Clean up temp files from compression
    compressed.cleanup();
  }
}

/**
 * Compresses and uploads a video from an in-memory buffer.
 *
 * @param {Buffer} buffer - Video buffer from multer memory storage
 * @param {Object} options
 * @param {string} [options.folder]
 * @param {string} [options.publicId]
 * @returns {Promise<{ secure_url: string, public_id: string, duration: number, bytes: number, compressionStats?: object }>}
 */
async function uploadVideoBuffer(buffer, options = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Video buffer is empty or invalid');
  }

  console.log(`[Cloudinary] Starting buffer upload with compression (${(buffer.length / 1e6).toFixed(1)} MB)...`);

  // Compress the buffer
  const compressed = await compressVideoBuffer(buffer);

  if (compressed.wasCompressed) {
    console.log(
      `[Cloudinary] 📦 Compression saved: ${(compressed.originalSize / 1e6).toFixed(1)} MB → ` +
      `${(compressed.compressedSize / 1e6).toFixed(1)} MB (${compressed.reductionPercent}% reduction)`
    );
  }

  const readableStream = Readable.from(compressed.buffer);
  const result = await _uploadStreamToCloudinary(readableStream, options);

  return {
    ...result,
    compressionStats: {
      originalSize: compressed.originalSize,
      compressedSize: compressed.compressedSize,
      reductionPercent: compressed.reductionPercent,
      wasCompressed: compressed.wasCompressed,
    },
  };
}

/**
 * Compresses and uploads a video from a file path on disk.
 *
 * @param {string} filePath - Absolute path to the video file
 * @param {Object} options
 * @param {string} [options.folder]
 * @param {string} [options.publicId]
 * @returns {Promise<{ secure_url: string, public_id: string, duration: number, bytes: number, compressionStats?: object }>}
 */
async function uploadVideoFile(filePath, options = {}) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Video file does not exist: ' + filePath);
  }

  const originalStats = fs.statSync(filePath);
  console.log(`[Cloudinary] Starting file upload with compression (${(originalStats.size / 1e6).toFixed(1)} MB)...`);

  // Compress the file
  const compressed = await compressVideoFile(filePath);

  if (compressed.wasCompressed) {
    console.log(
      `[Cloudinary] 📦 Compression saved: ${(compressed.originalSize / 1e6).toFixed(1)} MB → ` +
      `${(compressed.compressedSize / 1e6).toFixed(1)} MB (${compressed.reductionPercent}% reduction)`
    );
  }

  // Stream the (possibly compressed) file to Cloudinary
  const readableStream = fs.createReadStream(compressed.compressedPath);

  try {
    const result = await _uploadStreamToCloudinary(readableStream, options);

    return {
      ...result,
      compressionStats: {
        originalSize: compressed.originalSize,
        compressedSize: compressed.compressedSize,
        reductionPercent: compressed.reductionPercent,
        wasCompressed: compressed.wasCompressed,
      },
    };
  } finally {
    // Clean up the compressed temp file (but NOT the original — the caller owns it)
    if (compressed.wasCompressed && compressed.compressedPath !== filePath) {
      cleanupFile(compressed.compressedPath);
    }
  }
}

/**
 * Streams a document/file directly to Cloudinary.
 *
 * @param {import('stream').Readable} readableStream  - Node Readable stream of the data
 * @param {Object}  options
 * @param {string}  [options.folder]     - Cloudinary folder (default: 'chat-attachments')
 * @param {string}  [options.publicId]   - Custom public_id (auto-generated if omitted)
 * @returns {Promise<{ secure_url: string, public_id: string, bytes: number, format: string }>}
 */
async function uploadDocumentFromStream(readableStream, options = {}) {
  assertCloudinaryConfigured();

  const folder = options.folder || 'chat-attachments';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto', // Auto detects image, video, raw (pdf, doc, etc.)
        folder,
        ...(options.publicId ? { public_id: options.publicId } : {}),
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary] Document upload failed:', error.message);
          return reject(error);
        }

        console.log('[Cloudinary] Document uploaded successfully:', {
          public_id: result.public_id,
          bytes: result.bytes,
          format: result.format,
          resource_type: result.resource_type,
        });

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes || 0,
          format: result.format,
          resource_type: result.resource_type,
        });
      }
    );

    readableStream.pipe(uploadStream);

    readableStream.on('error', (err) => {
      console.error('[Cloudinary] Source stream error:', err.message);
      uploadStream.destroy(err);
      reject(err);
    });
  });
}

/**
 * Uploads a document from an in-memory buffer.
 *
 * @param {Buffer} buffer - Buffer from multer memory storage
 * @param {Object} options
 * @returns {Promise<{ secure_url: string, public_id: string, bytes: number, format: string }>}
 */
async function uploadDocumentBuffer(buffer, options = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('Document buffer is empty or invalid');
  }

  const readableStream = Readable.from(buffer);
  return uploadDocumentFromStream(readableStream, options);
}

/**
 * Builds a signed parameter payload for direct browser uploads to Cloudinary.
 *
 * @param {Object} options
 * @param {string} options.folder
 * @param {string} options.publicId
 * @param {number} [options.timestamp]
 * @param {boolean} [options.overwrite]
 * @returns {{
 *   cloudName: string,
 *   apiKey: string,
 *   folder: string,
 *   publicId: string,
 *   timestamp: number,
 *   overwrite: string,
 *   signature: string
 * }}
 */
function createSignedVideoUploadParams(options = {}) {
  assertCloudinaryConfigured();

  const cfg = cloudinary.config();
  const timestamp = Number(options.timestamp) || Math.floor(Date.now() / 1000);
  const folder = options.folder || 'session-recordings';
  const publicId = options.publicId;
  const overwrite = options.overwrite === false ? 'false' : 'true';

  if (!publicId) {
    throw new Error('publicId is required to create a signed upload payload');
  }

  const paramsToSign = {
    folder,
    public_id: publicId,
    overwrite,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, cfg.api_secret);

  return {
    cloudName: cfg.cloud_name,
    apiKey: cfg.api_key,
    folder,
    publicId,
    timestamp,
    overwrite,
    signature,
  };
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
 * @param {number} [options.version]
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
    ...(options.version ? { version: options.version } : {}),
    expires_at: expiresAt,
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
  uploadVideoBuffer,
  uploadVideoFile,
  uploadDocumentFromStream,
  uploadDocumentBuffer,
  createSignedVideoUploadParams,
  generateSignedUrl,
  generateSignedDeliveryUrl,
  deleteVideo,
};
