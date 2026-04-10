'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';

// ─── Types ─────────────────────────────────────────────────────────────────
interface RecordingData {
  _id: string | null;
  sessionId: string;
  meetingId: string;
  duration: number;
  recordingType: string;
  processingStatus: string;
  fileSize: number;
  createdAt: string;
  videoUrl: string | null;
  mentorName?: string;
  sessionDate?: string;
}

type PageState = 'loading' | 'not_found' | 'processing' | 'ready' | 'error';

// ─── Component ─────────────────────────────────────────────────────────────
export default function SessionRecordingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const sessionId = params?.id as string;

  const [state, setState] = useState<PageState>('loading');
  const [recording, setRecording] = useState<RecordingData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── Auth gate ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/sessions/${sessionId}/recording`);
    }
  }, [authLoading, user, router, sessionId]);

  // ── Fetch recording ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !sessionId) return;

    const fetchRecording = async () => {
      setState('loading');
      try {
        const res = await apiClient.get<RecordingData>(
          `/api/v1/recordings/${sessionId}`
        );

        if (!res.success || !res.data) {
          setState('not_found');
          setErrorMessage(res.error || res.message || 'Recording not found');
          return;
        }

        const data = res.data;
        setRecording(data);

        if (data.processingStatus === 'completed' && data.videoUrl) {
          setState('ready');
        } else if (
          ['pending', 'downloading', 'uploading'].includes(data.processingStatus)
        ) {
          setState('processing');
        } else if (data.processingStatus === 'failed') {
          setState('error');
          setErrorMessage('Recording processing failed. Please contact support.');
        } else {
          setState('not_found');
        }
      } catch {
        setState('error');
        setErrorMessage('Failed to load recording. Please try again.');
      }
    };

    fetchRecording();
  }, [user, sessionId]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '--:--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return '';
    if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(0)} KB`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ── Don't render until auth resolves ──────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loaderWrapper}>
          <div style={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Background decoration */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.contentWrapper}>
        {/* Header */}
        <header style={styles.header}>
          <button
            onClick={() => router.back()}
            style={styles.backButton}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
            }}
            id="back-to-dashboard"
          >
            ← Back
          </button>
          <h1 style={styles.pageTitle}>Session Recording</h1>
          <div style={{ width: 80 }} /> {/* Spacer for centering */}
        </header>

        {/* ─── LOADING STATE ────────────────────────────────────────────── */}
        {state === 'loading' && (
          <div style={styles.card}>
            <div style={styles.skeletonPlayer} />
            <div style={styles.metaRow}>
              <div style={{ ...styles.skeletonLine, width: '40%' }} />
              <div style={{ ...styles.skeletonLine, width: '25%' }} />
            </div>
            <div style={{ ...styles.skeletonLine, width: '60%', marginTop: 12 }} />
          </div>
        )}

        {/* ─── PROCESSING STATE ─────────────────────────────────────────── */}
        {state === 'processing' && (
          <div style={styles.card}>
            <div style={styles.processingContainer}>
              <div style={styles.pulseRing}>
                <div style={styles.pulseIcon}>⏳</div>
              </div>
              <h2 style={styles.processingTitle}>Recording is Being Processed</h2>
              <p style={styles.processingSubtext}>
                Your session recording is currently being uploaded and processed.
                This usually takes 2–5 minutes. Please check back shortly.
              </p>
              <div style={styles.statusBadgeContainer}>
                <span style={styles.statusBadge}>
                  {recording?.processingStatus === 'downloading'
                    ? '📥 Downloading from Zoom...'
                    : recording?.processingStatus === 'uploading'
                    ? '☁️ Uploading to cloud...'
                    : '⏳ Queued for processing...'}
                </span>
              </div>
              <button
                onClick={() => window.location.reload()}
                style={styles.refreshButton}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(78,69,226,0.35)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                  (e.target as HTMLElement).style.boxShadow = '0 4px 16px rgba(78,69,226,0.2)';
                }}
                id="refresh-recording-status"
              >
                ↻ Refresh Status
              </button>
            </div>
          </div>
        )}

        {/* ─── NOT FOUND STATE ──────────────────────────────────────────── */}
        {state === 'not_found' && (
          <div style={styles.card}>
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>🎬</div>
              <h2 style={styles.emptyTitle}>Recording Not Available Yet</h2>
              <p style={styles.emptySubtext}>
                {errorMessage || 'The recording for this session is not available. It may still be processing or the session has not been conducted yet.'}
              </p>
              <button
                onClick={() => router.back()}
                style={styles.refreshButton}
                id="go-back-from-empty"
              >
                ← Go Back
              </button>
            </div>
          </div>
        )}

        {/* ─── ERROR STATE ──────────────────────────────────────────────── */}
        {state === 'error' && (
          <div style={styles.card}>
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>⚠️</div>
              <h2 style={styles.emptyTitle}>Something Went Wrong</h2>
              <p style={styles.emptySubtext}>{errorMessage}</p>
              <button
                onClick={() => window.location.reload()}
                style={styles.refreshButton}
                id="retry-recording-load"
              >
                ↻ Try Again
              </button>
            </div>
          </div>
        )}

        {/* ─── READY STATE — VIDEO PLAYER ───────────────────────────────── */}
        {state === 'ready' && recording?.videoUrl && (
          <>
            <div style={styles.playerCard}>
              <video
                ref={videoRef}
                src={recording.videoUrl}
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
                style={styles.videoElement}
                id="recording-video-player"
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Metadata */}
            <div style={styles.metaCard}>
              <div style={styles.metaGrid}>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>⏱️ Duration</span>
                  <span style={styles.metaValue}>
                    {formatDuration(recording.duration)}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>📅 Recorded</span>
                  <span style={styles.metaValue}>
                    {formatDate(recording.createdAt)}
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <span style={styles.metaLabel}>📹 Type</span>
                  <span style={styles.metaValue}>
                    {(recording.recordingType || 'video')
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>
                </div>
                {recording.fileSize > 0 && (
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>💾 Size</span>
                    <span style={styles.metaValue}>
                      {formatFileSize(recording.fileSize)}
                    </span>
                  </div>
                )}
              </div>
              <div style={styles.securityNote}>
                🔒 This recording is securely stored and only accessible by session participants.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Inline keyframes for animations */}
      <style>{`
        @keyframes rec-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes rec-pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(78,69,226,0.3); }
          50% { box-shadow: 0 0 0 20px rgba(78,69,226,0); }
        }
        @keyframes rec-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #04070f 0%, #0b1220 40%, #101a2d 100%)',
    color: '#e6ecff',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-10%',
    right: '-5%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(78,69,226,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-15%',
    left: '-8%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(110,59,216,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 900,
    margin: '0 auto',
    padding: '24px 20px 60px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  backButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#c7d2fe',
    borderRadius: 12,
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    fontFamily: 'inherit',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: '-0.5px',
    background: 'linear-gradient(135deg, #c7d2fe, #9aa8f8, #6d7ef0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textAlign: 'center' as const,
    margin: 0,
  },
  // ── Cards ───────────────────────────────────────────────────────────────
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 32,
    backdropFilter: 'blur(12px)',
  },
  playerCard: {
    background: '#000',
    borderRadius: 20,
    overflow: 'hidden',
    border: '1.5px solid rgba(255,255,255,0.08)',
    boxShadow: '0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(78,69,226,0.1)',
  },
  metaCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '24px 28px',
    marginTop: 20,
    backdropFilter: 'blur(12px)',
  },
  // ── Video ───────────────────────────────────────────────────────────────
  videoElement: {
    width: '100%',
    display: 'block',
    maxHeight: '70vh',
    background: '#000',
    outline: 'none',
  },
  // ── Metadata ────────────────────────────────────────────────────────────
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 20,
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#68737d',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: 600,
    color: '#e6ecff',
  },
  metaRow: {
    display: 'flex',
    gap: 16,
    marginTop: 20,
  },
  securityNote: {
    marginTop: 20,
    padding: '14px 18px',
    background: 'rgba(78,69,226,0.08)',
    borderRadius: 12,
    fontSize: 13,
    color: '#9aa8f8',
    border: '1px solid rgba(78,69,226,0.15)',
    textAlign: 'center' as const,
  },
  // ── Processing state ────────────────────────────────────────────────────
  processingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '48px 24px',
    textAlign: 'center' as const,
  },
  pulseRing: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'rgba(78,69,226,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    animation: 'rec-pulse-ring 2s ease-in-out infinite',
  },
  pulseIcon: {
    fontSize: 36,
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#e6ecff',
    marginBottom: 12,
    letterSpacing: '-0.3px',
  },
  processingSubtext: {
    fontSize: 15,
    color: '#8a95a8',
    lineHeight: 1.6,
    maxWidth: 440,
    marginBottom: 24,
  },
  statusBadgeContainer: {
    marginBottom: 28,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: 50,
    background: 'rgba(78,69,226,0.12)',
    border: '1px solid rgba(78,69,226,0.25)',
    fontSize: 13,
    fontWeight: 600,
    color: '#9aa8f8',
  },
  refreshButton: {
    background: 'linear-gradient(135deg, #4e45e2, #6e3bd8)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 50,
    padding: '12px 32px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(78,69,226,0.2)',
    fontFamily: 'inherit',
  },
  // ── Empty / Not found ───────────────────────────────────────────────────
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '56px 24px',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 20,
    filter: 'grayscale(0.3)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#e6ecff',
    marginBottom: 12,
    letterSpacing: '-0.3px',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8a95a8',
    lineHeight: 1.6,
    maxWidth: 440,
    marginBottom: 28,
  },
  // ── Skeleton ────────────────────────────────────────────────────────────
  skeletonPlayer: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'rec-shimmer 1.5s ease-in-out infinite',
  },
  skeletonLine: {
    height: 18,
    borderRadius: 8,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'rec-shimmer 1.5s ease-in-out infinite',
  },
  // ── Loader ──────────────────────────────────────────────────────────────
  loaderWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#6d7ef0',
    borderRadius: '50%',
    animation: 'rec-spin 0.8s linear infinite',
  },
};
