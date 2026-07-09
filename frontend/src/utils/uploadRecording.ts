/**
 * Upload Recording Utility
 * ========================
 * Routes all video uploads through the backend's compress-and-upload endpoint
 * so every video is compressed with FFmpeg (H.264/AAC) before Cloudinary storage.
 *
 * Uses XMLHttpRequest (not fetch) to provide real-time upload progress.
 * Sends multipart/form-data with field name "video" to the recordings API.
 *
 * Upload flow:
 *   1. [preparing]   → Validate + prepare request
 *   2. [compressing]  → Upload to backend (server compresses with FFmpeg)
 *   3. [uploading]   → Backend uploads compressed video to Cloudinary
 *   4. [finalizing]  → Recording metadata saved
 */

import { resolveApiBaseUrl } from '@/utils/api-base';

export interface RecordingUploadResult {
  _id: string;
  sessionId: string;
  meetingId: string;
  duration: number;
  fileSize: number;
  recordingType: string;
  processingStatus: string;
  videoUrl: string;
  cloudinaryPublicId: string;
  compression?: {
    originalSize: number;
    compressedSize: number;
    reductionPercent: number;
    wasCompressed: boolean;
  };
}

export type UploadStage = 'preparing' | 'compressing' | 'uploading' | 'finalizing';

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percent: number;
  stage: UploadStage;
}

const API_BASE_URL = (resolveApiBaseUrl() || '').replace(/\/api\/v1\/?$/, '');

const getStoredToken = () =>
  typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

/**
 * Upload a video recording for a session with real-time progress tracking.
 * The video is sent to the backend, compressed server-side via FFmpeg,
 * and then uploaded to Cloudinary — all in one request.
 *
 * @param sessionId - The booking/session ID to attach the recording to
 * @param file      - The video File object from input or drag-and-drop
 * @param onProgress - Callback fired repeatedly with upload progress (0–100)
 * @returns Promise resolving to the recording data from the API
 */
export function uploadRecording(
  sessionId: string,
  file: File,
  onProgress?: (event: UploadProgressEvent) => void
): Promise<RecordingUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = `${API_BASE_URL}/api/v1/recordings/${sessionId}/compress-and-upload`;
    const formData = new FormData();

    formData.append('video', file);

    // ── Stage: Preparing ──────────────────────────────────────────────
    onProgress?.({
      loaded: 0,
      total: file.size,
      percent: 0,
      stage: 'preparing',
    });

    // ── Upload progress (sending file to backend for compression) ────
    let uploadFinished = false;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        // Upload to backend = 0–50% of total progress
        // (compression + Cloudinary upload happens server-side = 50–100%)
        const uploadPercent = Math.round((e.loaded / e.total) * 50);
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: uploadPercent,
          stage: 'compressing',
        });
      }
    });

    xhr.upload.addEventListener('loadend', () => {
      if (!uploadFinished) {
        uploadFinished = true;
        // File has been fully sent to the server — now it's compressing + uploading
        onProgress?.({
          loaded: file.size,
          total: file.size,
          percent: 70,
          stage: 'uploading',
        });
      }
    });

    // ── Response handling ─────────────────────────────────────────────
    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300 && response.success && response.data) {
          onProgress?.({
            loaded: file.size,
            total: file.size,
            percent: 100,
            stage: 'finalizing',
          });
          resolve(response.data as RecordingUploadResult);
          return;
        }

        reject(
          new Error(
            response.message || response.error || `Upload failed (HTTP ${xhr.status})`
          )
        );
      } catch {
        reject(new Error('Failed to parse server response'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload. Please check your connection.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out. The file may be too large for your connection.'));
    });

    // ── Send ──────────────────────────────────────────────────────────
    xhr.open('POST', uploadUrl);

    // Set auth header
    const token = getStoredToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    // Long timeout: compression can take a while for large files
    xhr.timeout = 30 * 60 * 1000; // 30 minutes
    xhr.send(formData);
  });
}

/**
 * Validate a video file before upload.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateVideoFile(file: File): string | null {
  const MAX_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
  const ALLOWED_TYPES = new Set([
    'video/mp4',
    'video/quicktime',     // .mov
    'video/x-matroska',    // .mkv
    'video/webm',
  ]);
  const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.webm'];

  // Check file extension as fallback (some browsers mis-report MIME types)
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  const hasValidExtension = ALLOWED_EXTENSIONS.includes(extension);
  const hasValidMime = ALLOWED_TYPES.has(file.type) || file.type.startsWith('video/');

  if (!hasValidExtension && !hasValidMime) {
    return `Unsupported file format "${extension}". Please upload .mp4, .mov, .mkv, or .webm files.`;
  }

  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File is too large (${sizeMB} MB). Maximum allowed size is 500 MB.`;
  }

  if (file.size === 0) {
    return 'File is empty. Please select a valid video file.';
  }

  return null;
}
