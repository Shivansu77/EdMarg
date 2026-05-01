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

export type UploadStage = 'preparing' | 'uploading' | 'finalizing';

export interface UploadProgressEvent {
  loaded: number;
  total: number;
  percent: number;
  stage: UploadStage;
}

const API_BASE_URL = (resolveApiBaseUrl() || '').replace(/\/api\/v1\/?$/, '');

interface UploadSignaturePayload {
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
  timestamp: number;
  overwrite: string;
  signature: string;
  meetingId: string;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  duration?: number;
  bytes?: number;
  error?: {
    message?: string;
  };
}

const getStoredToken = () =>
  typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

const buildAuthorizedHeaders = (contentType?: string) => {
  const headers = new Headers();
  const token = getStoredToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  return headers;
};

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const raw = await response.text();
  if (!raw) {
    return {} as T;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error('Failed to parse server response');
  }
};

const requestUploadSignature = async (
  sessionId: string
): Promise<UploadSignaturePayload> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/recordings/${sessionId}/upload-signature`, {
    method: 'POST',
    credentials: 'include',
    headers: buildAuthorizedHeaders(),
  });

  const result = await parseJsonResponse<{
    success?: boolean;
    data?: UploadSignaturePayload;
    message?: string;
    error?: string;
  }>(response);

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || result.error || 'Failed to prepare recording upload');
  }

  return result.data;
};

const finalizeUpload = async (
  sessionId: string,
  payload: {
    secureUrl: string;
    publicId: string;
    duration?: number;
    bytes?: number;
  }
): Promise<RecordingUploadResult> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/recordings/${sessionId}/complete-upload`, {
    method: 'POST',
    credentials: 'include',
    headers: buildAuthorizedHeaders('application/json'),
    body: JSON.stringify(payload),
  });

  const result = await parseJsonResponse<{
    success?: boolean;
    data?: RecordingUploadResult;
    message?: string;
    error?: string;
  }>(response);

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || result.error || 'Failed to finalize recording upload');
  }

  return result.data;
};

const uploadToCloudinary = (
  file: File,
  signaturePayload: UploadSignaturePayload,
  onProgress?: (event: UploadProgressEvent) => void
): Promise<CloudinaryUploadResponse> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signaturePayload.cloudName}/video/upload`;
    const formData = new FormData();

    formData.append('file', file);
    formData.append('api_key', signaturePayload.apiKey);
    formData.append('timestamp', String(signaturePayload.timestamp));
    formData.append('signature', signaturePayload.signature);
    formData.append('folder', signaturePayload.folder);
    formData.append('public_id', signaturePayload.publicId);
    formData.append('overwrite', signaturePayload.overwrite);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100),
          stage: 'uploading',
        });
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const response = JSON.parse(xhr.responseText) as CloudinaryUploadResponse;

        if (xhr.status >= 200 && xhr.status < 300 && response.secure_url && response.public_id) {
          resolve(response);
          return;
        }

        reject(
          new Error(
            response.error?.message || `Cloud upload failed (HTTP ${xhr.status})`
          )
        );
      } catch {
        reject(new Error('Failed to parse cloud upload response'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during cloud upload. Please check your connection.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out. The file may be too large for your connection.'));
    });

    xhr.open('POST', uploadUrl);
    xhr.timeout = 10 * 60 * 1000;
    xhr.send(formData);
  });

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
  return (async () => {
    onProgress?.({
      loaded: 0,
      total: file.size,
      percent: 0,
      stage: 'preparing',
    });

    const signaturePayload = await requestUploadSignature(sessionId);
    const cloudinaryUpload = await uploadToCloudinary(file, signaturePayload, onProgress);

    onProgress?.({
      loaded: file.size,
      total: file.size,
      percent: 100,
      stage: 'finalizing',
    });

    return finalizeUpload(sessionId, {
      secureUrl: String(cloudinaryUpload.secure_url),
      publicId: String(cloudinaryUpload.public_id),
      duration: cloudinaryUpload.duration,
      bytes: cloudinaryUpload.bytes,
    });
  })();
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
