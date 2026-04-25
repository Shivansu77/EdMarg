'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Film,
  CloudUpload,
} from 'lucide-react';
import {
  uploadRecording,
  validateVideoFile,
  type RecordingUploadResult,
  type UploadProgressEvent,
} from '@/utils/uploadRecording';

// ─── Types ──────────────────────────────────────────────────────────────────
type UploadState = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

interface RecordingUploaderProps {
  sessionId: string;
  onUploadComplete?: (recording: RecordingUploadResult) => void;
  onError?: (message: string) => void;
  onClose?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function RecordingUploader({
  sessionId,
  onUploadComplete,
  onError,
  onClose,
}: RecordingUploaderProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File Selection ──────────────────────────────────────────────────────
  const handleFileSelect = useCallback((selectedFile: File) => {
    const validationError = validateVideoFile(selectedFile);
    if (validationError) {
      setErrorMessage(validationError);
      setState('error');
      onError?.(validationError);
      return;
    }

    setFile(selectedFile);
    setErrorMessage('');
    setState('idle');
  }, [onError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  // ── Upload ──────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;

    setState('uploading');
    setProgress(0);
    setErrorMessage('');

    try {
      const result = await uploadRecording(
        sessionId,
        file,
        (event: UploadProgressEvent) => {
          setProgress(event.percent);
        }
      );

      setState('success');
      setProgress(100);
      onUploadComplete?.(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setErrorMessage(message);
      setState('error');
      onError?.(message);
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFile(null);
    setProgress(0);
    setErrorMessage('');
    setState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(0)} KB`;
  };

  const getFileExtension = (name: string) => {
    return name.slice(name.lastIndexOf('.')).toUpperCase();
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIcon}>
              <CloudUpload size={20} />
            </div>
            <div>
              <h2 style={styles.title}>Upload Recording</h2>
              <p style={styles.subtitle}>Upload a session recording video</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={styles.closeButton}
              id="close-upload-modal"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* ── SUCCESS STATE ─────────────────────────────────────────── */}
          {state === 'success' && (
            <div style={styles.successContainer}>
              <div style={styles.successIcon}>
                <CheckCircle2 size={40} color="#10b981" />
              </div>
              <h3 style={styles.successTitle}>Recording Uploaded!</h3>
              <p style={styles.successText}>
                Your recording has been securely uploaded and is now available
                for both you and the student to watch.
              </p>
              <button
                onClick={onClose}
                style={styles.primaryButton}
                id="upload-success-done"
              >
                Done
              </button>
            </div>
          )}

          {/* ── UPLOADING STATE ───────────────────────────────────────── */}
          {state === 'uploading' && (
            <div style={styles.uploadingContainer}>
              <div style={styles.uploadingHeader}>
                <Film size={18} color="#64748b" />
                <div style={styles.uploadingFileInfo}>
                  <p style={styles.uploadingFileName}>{file?.name}</p>
                  <p style={styles.uploadingFileSize}>
                    {file ? formatFileSize(file.size) : ''}
                  </p>
                </div>
                <span style={styles.uploadingPercent}>{progress}%</span>
              </div>

              {/* Progress bar */}
              <div style={styles.progressTrack}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p style={styles.uploadingHint}>
                {progress < 100
                  ? 'Uploading to cloud storage... Please keep this window open.'
                  : 'Finalizing upload...'}
              </p>
            </div>
          )}

          {/* ── IDLE / ERROR STATE (File selection) ───────────────────── */}
          {(state === 'idle' || state === 'error') && (
            <>
              {/* Drop zone */}
              <div
                style={{
                  ...styles.dropZone,
                  ...(isDragOver ? styles.dropZoneActive : {}),
                  ...(file ? styles.dropZoneWithFile : {}),
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                id="recording-drop-zone"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-matroska,video/webm,.mp4,.mov,.mkv,.webm"
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                  id="recording-file-input"
                />

                {file ? (
                  <div style={styles.selectedFileDisplay}>
                    <div style={styles.fileBadge}>
                      <Film size={20} color="#10b981" />
                      <span style={styles.fileExtBadge}>
                        {getFileExtension(file.name)}
                      </span>
                    </div>
                    <p style={styles.selectedFileName}>{file.name}</p>
                    <p style={styles.selectedFileSize}>
                      {formatFileSize(file.size)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      style={styles.changeFileButton}
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <div style={styles.dropZoneContent}>
                    <div style={styles.dropIcon}>
                      <Upload size={24} color={isDragOver ? '#10b981' : '#94a3b8'} />
                    </div>
                    <p style={styles.dropPrimary}>
                      {isDragOver ? 'Drop your video here' : 'Drag & drop your recording'}
                    </p>
                    <p style={styles.dropSecondary}>
                      or <span style={styles.dropLink}>browse files</span>
                    </p>
                    <p style={styles.dropFormats}>
                      MP4, MOV, MKV, WebM · Up to 250 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Error message */}
              {state === 'error' && errorMessage && (
                <div style={styles.errorBanner}>
                  <AlertCircle size={16} color="#ef4444" />
                  <p style={styles.errorText}>{errorMessage}</p>
                </div>
              )}

              {/* Upload button */}
              {file && state !== 'error' && (
                <button
                  onClick={handleUpload}
                  style={styles.primaryButton}
                  id="start-upload-button"
                >
                  <CloudUpload size={18} />
                  Upload Recording
                </button>
              )}

              {/* Retry button after error */}
              {state === 'error' && file && (
                <div style={styles.errorActions}>
                  <button
                    onClick={handleUpload}
                    style={styles.primaryButton}
                    id="retry-upload-button"
                  >
                    Retry Upload
                  </button>
                  <button
                    onClick={handleReset}
                    style={styles.secondaryButton}
                  >
                    Choose Another File
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        {state !== 'success' && (
          <div style={styles.footer}>
            <p style={styles.footerText}>
              🔒 Videos are securely stored in the cloud and only accessible by session participants.
            </p>
          </div>
        )}
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes rec-upload-fadein {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes rec-upload-overlay {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes rec-progress-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes rec-progress-stripe {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(6px)',
    animation: 'rec-upload-overlay 0.2s ease-out',
    padding: 20,
  },
  modal: {
    background: '#ffffff',
    borderRadius: 20,
    boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
    width: '100%',
    maxWidth: 520,
    overflow: 'hidden',
    animation: 'rec-upload-fadein 0.3s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f5f9',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    color: '#059669',
    flexShrink: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    margin: '2px 0 0',
    fontWeight: 500,
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#ffffff',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  content: {
    padding: '24px',
  },

  // ── Drop Zone ─────────────────────────────────────────────────────────
  dropZone: {
    border: '2px dashed #cbd5e1',
    borderRadius: 16,
    padding: '40px 24px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    background: '#fafbfc',
  },
  dropZoneActive: {
    borderColor: '#10b981',
    background: '#ecfdf5',
    transform: 'scale(1.01)',
  },
  dropZoneWithFile: {
    borderColor: '#10b981',
    borderStyle: 'solid' as const,
    background: '#f0fdf4',
    padding: '28px 24px',
  },
  dropZoneContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
  },
  dropIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dropPrimary: {
    fontSize: 15,
    fontWeight: 700,
    color: '#1e293b',
    margin: 0,
  },
  dropSecondary: {
    fontSize: 13,
    color: '#94a3b8',
    margin: 0,
    fontWeight: 500,
  },
  dropLink: {
    color: '#10b981',
    fontWeight: 600,
    textDecoration: 'underline' as const,
    textUnderlineOffset: '2px',
  },
  dropFormats: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 600,
    marginTop: 8,
    letterSpacing: '0.3px',
  },

  // ── Selected File ─────────────────────────────────────────────────────
  selectedFileDisplay: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 6,
  },
  fileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fileExtBadge: {
    fontSize: 10,
    fontWeight: 800,
    color: '#059669',
    background: '#d1fae5',
    padding: '3px 8px',
    borderRadius: 6,
    letterSpacing: '0.5px',
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    wordBreak: 'break-all' as const,
    textAlign: 'center' as const,
  },
  selectedFileSize: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: 600,
    margin: 0,
  },
  changeFileButton: {
    fontSize: 12,
    fontWeight: 600,
    color: '#10b981',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline' as const,
    textUnderlineOffset: '2px',
    marginTop: 4,
    padding: 0,
  },

  // ── Uploading ─────────────────────────────────────────────────────────
  uploadingContainer: {
    padding: '8px 0',
  },
  uploadingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  uploadingFileInfo: {
    flex: 1,
    minWidth: 0,
  },
  uploadingFileName: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  uploadingFileSize: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 600,
    margin: '2px 0 0',
  },
  uploadingPercent: {
    fontSize: 20,
    fontWeight: 800,
    color: '#10b981',
    fontVariantNumeric: 'tabular-nums',
    animation: 'rec-progress-pulse 1.5s ease-in-out infinite',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    background: '#f1f5f9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #10b981, #059669)',
    transition: 'width 0.3s ease',
    backgroundImage:
      'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
    backgroundSize: '40px 40px',
    animation: 'rec-progress-stripe 1s linear infinite',
  },
  uploadingHint: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 500,
    marginTop: 12,
    textAlign: 'center' as const,
  },

  // ── Success ───────────────────────────────────────────────────────────
  successContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '20px 0',
    textAlign: 'center' as const,
    gap: 12,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  successText: {
    fontSize: 14,
    color: '#64748b',
    maxWidth: 360,
    lineHeight: 1.6,
    margin: 0,
  },

  // ── Error ─────────────────────────────────────────────────────────────
  errorBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    padding: '12px 16px',
    borderRadius: 12,
    background: '#fef2f2',
    border: '1px solid #fecaca',
  },
  errorText: {
    fontSize: 13,
    color: '#991b1b',
    fontWeight: 600,
    margin: 0,
    lineHeight: 1.5,
  },
  errorActions: {
    display: 'flex',
    gap: 10,
    marginTop: 16,
  },

  // ── Buttons ───────────────────────────────────────────────────────────
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '13px 24px',
    fontSize: 14,
    fontWeight: 700,
    color: '#ffffff',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: 16,
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
    fontFamily: 'inherit',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
    padding: '13px 24px',
    fontSize: 14,
    fontWeight: 700,
    color: '#475569',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },

  // ── Footer ────────────────────────────────────────────────────────────
  footer: {
    padding: '14px 24px',
    borderTop: '1px solid #f1f5f9',
    background: '#fafbfc',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 500,
    margin: 0,
    textAlign: 'center' as const,
  },
};
