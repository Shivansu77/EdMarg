/**
 * Upload Recording Utility
 * ========================
 * Uses XMLHttpRequest (not fetch) to provide real-time upload progress.
 * Sends multipart/form-data with field name "video" to the recordings API.
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
}

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percent: number;
}

const API_BASE_URL = (resolveApiBaseUrl() || '').replace(/\/api\/v1\/?$/, '');

/**
 * Upload a video recording for a session with real-time progress tracking.
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
    const url = `${API_BASE_URL}/api/v1/recordings/${sessionId}/upload`;

    // Build FormData with the video file
    const formData = new FormData();
    formData.append('video', file);

    // Progress tracking
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
        });
      }
    });

    // Success handler
    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300 && response.success) {
          resolve(response.data);
        } else {
          reject(
            new Error(
              response.message || response.error || `Upload failed (HTTP ${xhr.status})`
            )
          );
        }
      } catch {
        reject(new Error('Failed to parse server response'));
      }
    });

    // Error handlers
    xhr.addEventListener('error', () => {
      reject(new Error('Network error — upload failed. Please check your connection.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out. The file may be too large for your connection.'));
    });

    // Configure and send
    xhr.open('POST', url);
    xhr.timeout = 10 * 60 * 1000; // 10 minutes for large files

    // Auth token
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('token')
        : null;

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

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
    return `File is too large (${sizeMB} MB). Maximum allowed size is 250 MB.`;
  }

  if (file.size === 0) {
    return 'File is empty. Please select a valid video file.';
  }

  return null;
}
