// @ts-nocheck
/**
 * Video Compression Service
 * =========================
 * Production-grade FFmpeg video compression that mirrors what platforms like
 * Udemy and YouTube do before storing videos:
 *
 *   - H.264 (libx264) video codec — universal browser support
 *   - AAC audio at 128 kbps
 *   - CRF 28 — great quality with ~60-75 % size reduction
 *   - Preset "medium" — good speed/compression trade-off
 *   - 1080p resolution cap (scales down if source is bigger)
 *   - yuv420p pixel format — maximum device compatibility
 *   - "-movflags +faststart" — moov atom at front for instant web playback
 *
 * The service writes to temporary files in `backend/uploads/tmp/` and
 * cleans them up once the compressed data has been consumed.
 *
 * If FFmpeg fails for any reason the service returns the original data so
 * the upload pipeline never breaks.
 */

const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const crypto = require('crypto');

// ─── Paths ──────────────────────────────────────────────────────────────────
const TMP_DIR = path.join(__dirname, '..', 'uploads', 'tmp');

// Ensure the temp directory exists
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Generate a unique temp filename */
function tmpPath(ext = '.mp4') {
  return path.join(TMP_DIR, `compress_${crypto.randomBytes(8).toString('hex')}_${Date.now()}${ext}`);
}

/** Safely remove a file if it exists */
function cleanupFile(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('[Compression] Cleanup failed for', filePath, err.message);
  }
}

/** Format bytes into a human-readable string */
function formatBytes(bytes) {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

/** Check whether FFmpeg is available on the system */
function isFFmpegAvailable() {
  return new Promise((resolve) => {
    const proc = require('child_process').spawn('ffmpeg', ['-version']);
    proc.on('error', () => resolve(false));
    proc.on('close', (code) => resolve(code === 0));
  });
}

// ─── Core Compression ──────────────────────────────────────────────────────

/**
 * Runs FFmpeg on `inputPath` and writes the compressed output to `outputPath`.
 * Returns a promise that resolves when the conversion is complete.
 */
function runCompression(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      // ── Video settings ───────────────────────────────────────────
      .videoCodec('libx264')
      .addOutputOptions([
        '-crf', '28',                    // Constant Rate Factor (lower = better quality)
        '-preset', 'medium',             // Encoding speed/compression trade-off
        '-pix_fmt', 'yuv420p',           // Maximum compatibility
        '-movflags', '+faststart',       // Moov atom at front for instant web playback
        '-max_muxing_queue_size', '4096', // Prevent muxing queue overflow
      ])
      // Scale down to 1080p if larger, keep aspect ratio, ensure even dimensions
      .videoFilter('scale=\'min(1920,iw)\':\'min(1080,ih)\':force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2')
      // ── Audio settings ───────────────────────────────────────────
      .audioCodec('aac')
      .audioBitrate('128k')
      .audioChannels(2)
      // ── Output ───────────────────────────────────────────────────
      .format('mp4')
      .output(outputPath)
      .on('start', (cmd) => {
        console.log('[Compression] FFmpeg started:', cmd);
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          console.log(`[Compression] Progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log('[Compression] FFmpeg completed successfully');
        resolve();
      })
      .on('error', (err, stdout, stderr) => {
        console.error('[Compression] FFmpeg error:', err.message);
        if (stderr) {
          console.error('[Compression] FFmpeg stderr:', stderr.slice(-500));
        }
        reject(err);
      })
      .run();
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Compresses a video from an in-memory Buffer.
 *
 * @param {Buffer} buffer            - Raw video data
 * @param {Object} [options]
 * @param {string} [options.inputExt]  - Original file extension (default: '.webm')
 * @returns {Promise<{
 *   buffer: Buffer,
 *   originalSize: number,
 *   compressedSize: number,
 *   reductionPercent: number,
 *   wasCompressed: boolean
 * }>}
 */
async function compressVideoBuffer(buffer, options = {}) {
  const originalSize = buffer.length;
  const inputExt = options.inputExt || '.webm';
  const inputPath = tmpPath(inputExt);
  const outputPath = tmpPath('.mp4');

  try {
    // Check if FFmpeg is available
    const ffmpegReady = await isFFmpegAvailable();
    if (!ffmpegReady) {
      console.warn('[Compression] FFmpeg not available — uploading original file');
      return {
        buffer,
        originalSize,
        compressedSize: originalSize,
        reductionPercent: 0,
        wasCompressed: false,
      };
    }

    // Write buffer to temp file
    fs.writeFileSync(inputPath, buffer);
    console.log(`[Compression] Input: ${formatBytes(originalSize)} (${inputExt})`);

    // Run FFmpeg
    await runCompression(inputPath, outputPath);

    // Read compressed output
    const compressedBuffer = fs.readFileSync(outputPath);
    const compressedSize = compressedBuffer.length;
    const reductionPercent = Math.round((1 - compressedSize / originalSize) * 100);

    console.log(
      `[Compression] ✅ ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} ` +
      `(${reductionPercent}% reduction)`
    );

    // If compression actually made it larger (rare, very short clips), use original
    if (compressedSize >= originalSize) {
      console.log('[Compression] Compressed file is not smaller — using original');
      return {
        buffer,
        originalSize,
        compressedSize: originalSize,
        reductionPercent: 0,
        wasCompressed: false,
      };
    }

    return {
      buffer: compressedBuffer,
      originalSize,
      compressedSize,
      reductionPercent,
      wasCompressed: true,
    };
  } catch (err) {
    console.error('[Compression] Failed — falling back to original:', err.message);
    return {
      buffer,
      originalSize,
      compressedSize: originalSize,
      reductionPercent: 0,
      wasCompressed: false,
    };
  } finally {
    cleanupFile(inputPath);
    cleanupFile(outputPath);
  }
}

/**
 * Compresses a video from a file on disk.
 *
 * @param {string} filePath - Absolute path to the video file
 * @returns {Promise<{
 *   compressedPath: string,
 *   originalSize: number,
 *   compressedSize: number,
 *   reductionPercent: number,
 *   wasCompressed: boolean
 * }>}
 */
async function compressVideoFile(filePath, options = {}) {
  const stats = fs.statSync(filePath);
  const originalSize = stats.size;
  const outputPath = tmpPath('.mp4');

  try {
    // Check if FFmpeg is available
    const ffmpegReady = await isFFmpegAvailable();
    if (!ffmpegReady) {
      console.warn('[Compression] FFmpeg not available — uploading original file');
      return {
        compressedPath: filePath,
        originalSize,
        compressedSize: originalSize,
        reductionPercent: 0,
        wasCompressed: false,
      };
    }

    console.log(`[Compression] Input file: ${formatBytes(originalSize)} (${path.extname(filePath)})`);

    // Run FFmpeg
    await runCompression(filePath, outputPath);

    const compressedStats = fs.statSync(outputPath);
    const compressedSize = compressedStats.size;
    const reductionPercent = Math.round((1 - compressedSize / originalSize) * 100);

    console.log(
      `[Compression] ✅ ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} ` +
      `(${reductionPercent}% reduction)`
    );

    // If compression made it larger, return original path
    if (compressedSize >= originalSize) {
      console.log('[Compression] Compressed file is not smaller — using original');
      cleanupFile(outputPath);
      return {
        compressedPath: filePath,
        originalSize,
        compressedSize: originalSize,
        reductionPercent: 0,
        wasCompressed: false,
      };
    }

    return {
      compressedPath: outputPath,
      originalSize,
      compressedSize,
      reductionPercent,
      wasCompressed: true,
    };
  } catch (err) {
    console.error('[Compression] Failed — falling back to original:', err.message);
    cleanupFile(outputPath);
    return {
      compressedPath: filePath,
      originalSize,
      compressedSize: originalSize,
      reductionPercent: 0,
      wasCompressed: false,
    };
  }
}

/**
 * Compresses a video from a Readable stream (e.g. Zoom download).
 * Collects the stream to a temp file, compresses, and returns a new
 * Readable stream of the compressed data.
 *
 * @param {import('stream').Readable} readableStream
 * @returns {Promise<{
 *   stream: import('stream').Readable,
 *   originalSize: number,
 *   compressedSize: number,
 *   reductionPercent: number,
 *   wasCompressed: boolean,
 *   cleanup: () => void
 * }>}
 */
async function compressVideoStream(readableStream) {
  const inputPath = tmpPath('.webm');
  const outputPath = tmpPath('.mp4');

  try {
    // Check if FFmpeg is available
    const ffmpegReady = await isFFmpegAvailable();
    if (!ffmpegReady) {
      console.warn('[Compression] FFmpeg not available — passing stream through');
      return {
        stream: readableStream,
        originalSize: 0,
        compressedSize: 0,
        reductionPercent: 0,
        wasCompressed: false,
        cleanup: () => {},
      };
    }

    // Collect the stream to a temp file
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(inputPath);
      readableStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      readableStream.on('error', reject);
    });

    const originalSize = fs.statSync(inputPath).size;
    console.log(`[Compression] Stream collected: ${formatBytes(originalSize)}`);

    // Run FFmpeg
    await runCompression(inputPath, outputPath);

    const compressedSize = fs.statSync(outputPath).size;
    const reductionPercent = Math.round((1 - compressedSize / originalSize) * 100);

    console.log(
      `[Compression] ✅ Stream: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} ` +
      `(${reductionPercent}% reduction)`
    );

    // If compression made it larger, return original
    if (compressedSize >= originalSize) {
      console.log('[Compression] Compressed stream is not smaller — using original');
      cleanupFile(outputPath);
      const originalStream = fs.createReadStream(inputPath);
      return {
        stream: originalStream,
        originalSize,
        compressedSize: originalSize,
        reductionPercent: 0,
        wasCompressed: false,
        cleanup: () => cleanupFile(inputPath),
      };
    }

    // Clean up original, return compressed stream
    cleanupFile(inputPath);
    const compressedStream = fs.createReadStream(outputPath);

    return {
      stream: compressedStream,
      originalSize,
      compressedSize,
      reductionPercent,
      wasCompressed: true,
      cleanup: () => cleanupFile(outputPath),
    };
  } catch (err) {
    console.error('[Compression] Stream compression failed — passing original:', err.message);
    cleanupFile(outputPath);

    // Try to return a stream from the saved input file
    if (fs.existsSync(inputPath)) {
      const fallbackStream = fs.createReadStream(inputPath);
      return {
        stream: fallbackStream,
        originalSize: fs.statSync(inputPath).size,
        compressedSize: fs.statSync(inputPath).size,
        reductionPercent: 0,
        wasCompressed: false,
        cleanup: () => cleanupFile(inputPath),
      };
    }

    // Last resort: return the original stream (may already be consumed)
    return {
      stream: readableStream,
      originalSize: 0,
      compressedSize: 0,
      reductionPercent: 0,
      wasCompressed: false,
      cleanup: () => {},
    };
  }
}

module.exports = {
  compressVideoBuffer,
  compressVideoFile,
  compressVideoStream,
  cleanupFile,
  isFFmpegAvailable,
};
