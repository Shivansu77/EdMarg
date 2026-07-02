'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/utils/api-client';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  AlertCircle,
  Loader2,
  Clock,
  Film,
  Settings,
  PictureInPicture2,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface RecordingData {
  _id: string;
  sessionId: string;
  meetingId: string;
  duration: number;
  recordingType: string;
  processingStatus: 'pending' | 'downloading' | 'uploading' | 'completed' | 'failed';
  fileSize?: number;
  createdAt: string;
  videoUrl: string | null;
}

interface SessionRecordingPlayerProps {
  sessionId: string;
  /** Optional: show inline (no card wrapper) */
  inline?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds) || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SKIP_SECONDS = 10;

// ─── Component ──────────────────────────────────────────────────────────────
export default function SessionRecordingPlayer({
  sessionId,
  inline = false,
}: SessionRecordingPlayerProps) {
  // ─── State ──────────────────────────────────────────────────────────────
  const [recording, setRecording] = useState<RecordingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const doubleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCountRef = useRef(0);

  // ─── Fetch Recording ──────────────────────────────────────────────────
  const fetchRecording = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get<RecordingData>(
        `/api/v1/recordings/${sessionId}`
      );
      if (response.success && response.data) {
        setRecording(response.data);
      } else {
        setError(response.message || 'Recording not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recording');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchRecording();
  }, [fetchRecording]);

  // ─── Fullscreen Tracking ──────────────────────────────────────────────
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ─── Close speed menu on outside click ────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpeedMenu]);

  // ─── Keyboard Shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle when this player is focused or in fullscreen
      if (!containerRef.current) return;
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          setShowSpeedMenu(false);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, volume]);

  // ─── Video Controls ───────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (!hasStarted) setHasStarted(true);

    if (videoRef.current.paused) {
      const p = videoRef.current.play();
      if (p !== undefined) {
        playPromiseRef.current = p;
        p.catch(() => {}).finally(() => {
          playPromiseRef.current = null;
        });
      }
      setIsPlaying(true);
    } else {
      if (playPromiseRef.current) {
        playPromiseRef.current.then(() => {
          videoRef.current?.pause();
          setIsPlaying(false);
        }).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [hasStarted]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  const adjustVolume = useCallback((delta: number) => {
    if (!videoRef.current) return;
    const newVol = Math.max(0, Math.min(1, videoRef.current.volume + delta));
    videoRef.current.volume = newVol;
    setVolume(newVol);
    if (newVol === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (videoRef.current.muted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.volume = val;
    setVolume(val);
    if (val === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);

  const skipForward = useCallback(() => {
    if (!videoRef.current) return;
    const t = Math.min(videoRef.current.duration, videoRef.current.currentTime + SKIP_SECONDS);
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  const skipBackward = useCallback(() => {
    if (!videoRef.current) return;
    const t = Math.max(0, videoRef.current.currentTime - SKIP_SECONDS);
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      // PiP not supported
    }
  }, []);

  const changeSpeed = useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  // ─── Progress Bar Interaction ─────────────────────────────────────────
  const handleProgressHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  }, [duration]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleProgressClick(e);

    const handleMouseMove = (ev: MouseEvent) => {
      if (!progressRef.current || !videoRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const newTime = pos * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setHoverPosition(pos * 100);
      setHoverTime(newTime);
    };

    const handleMouseUp = () => {
      setIsSeeking(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [duration, handleProgressClick]);

  // ─── Auto-hide Controls ───────────────────────────────────────────────
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying && !showSpeedMenu) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, showSpeedMenu]);

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // ─── Click/DoubleClick on video ───────────────────────────────────────
  const handleVideoClick = useCallback(() => {
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      doubleClickTimerRef.current = setTimeout(() => {
        // Single click -> toggle play
        togglePlay();
        clickCountRef.current = 0;
      }, 250);
    } else if (clickCountRef.current === 2) {
      // Double click -> toggle fullscreen
      if (doubleClickTimerRef.current) {
        clearTimeout(doubleClickTimerRef.current);
      }
      toggleFullscreen();
      clickCountRef.current = 0;
    }
  }, [togglePlay, toggleFullscreen]);

  // ─── Buffer Update ────────────────────────────────────────────────────
  const updateBuffered = useCallback(() => {
    if (!videoRef.current || !videoRef.current.buffered.length) return;
    const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
    setBuffered(end);
  }, []);

  // Context menu prevention
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // ─── Computed Values ──────────────────────────────────────────────────
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  // ─── Loading Skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={wrapperClass(inline)}>
        <div className="srp-skeleton">
          <div className="srp-skeleton-inner">
            <Loader2 className="srp-spin" style={{ width: 48, height: 48, color: '#34d399' }} />
          </div>
          <div className="srp-skeleton-bar" />
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={wrapperClass(inline)}>
        <div className="srp-error-state">
          <AlertCircle style={{ width: 48, height: 48, color: '#f87171' }} />
          <p className="srp-error-text">{error}</p>
          <button onClick={fetchRecording} className="srp-retry-btn">
            <RotateCcw style={{ width: 16, height: 16 }} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Processing State ─────────────────────────────────────────────────
  if (recording && recording.processingStatus !== 'completed') {
    const statusMessages: Record<string, { label: string; color: string }> = {
      pending: { label: 'Recording is queued for processing...', color: '#fbbf24' },
      downloading: { label: 'Downloading recording from Zoom...', color: '#60a5fa' },
      uploading: { label: 'Uploading to secure storage...', color: '#34d399' },
      failed: { label: 'Processing failed. Please contact support.', color: '#f87171' },
    };
    const status = statusMessages[recording.processingStatus] || statusMessages.pending;

    return (
      <div className={wrapperClass(inline)}>
        <div className="srp-processing-state">
          {recording.processingStatus !== 'failed' ? (
            <Loader2 className="srp-spin" style={{ width: 48, height: 48, color: status.color }} />
          ) : (
            <AlertCircle style={{ width: 48, height: 48, color: status.color }} />
          )}
          <p style={{ color: status.color, fontWeight: 500, fontSize: 14 }}>{status.label}</p>
          {recording.processingStatus !== 'failed' && (
            <button onClick={fetchRecording} className="srp-refresh-btn">
              <RotateCcw style={{ width: 16, height: 16 }} />
              Refresh Status
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── No Video URL ─────────────────────────────────────────────────────
  if (!recording?.videoUrl) {
    return (
      <div className={wrapperClass(inline)}>
        <div className="srp-no-video">
          <Film style={{ width: 48, height: 48, color: '#6b7280' }} />
          <p style={{ color: '#9ca3af', fontSize: 14 }}>No recording available</p>
        </div>
      </div>
    );
  }

  // ─── Video Player ─────────────────────────────────────────────────────
  return (
    <div className={wrapperClass(inline)}>
      <style>{playerStyles}</style>

      {/* Main Video Container */}
      <div
        ref={containerRef}
        className={`srp-container ${isFullscreen ? 'srp-fullscreen' : ''} ${showControls || !isPlaying ? 'srp-show-cursor' : 'srp-hide-cursor'}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          if (isPlaying) setShowControls(false);
          setShowVolumeSlider(false);
        }}
        onContextMenu={handleContextMenu}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={recording.videoUrl}
          className="srp-video"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture={false}
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              const dur = videoRef.current.duration;
              if (isFinite(dur)) setDuration(dur);
            }
          }}
          onDurationChange={() => {
            if (videoRef.current) {
              const dur = videoRef.current.duration;
              if (isFinite(dur)) setDuration(dur);
            }
          }}
          onProgress={updateBuffered}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsBuffering(true)}
          onCanPlay={() => setIsBuffering(false)}
          onEnded={() => {
            setIsPlaying(false);
            setShowControls(true);
          }}
          onClick={handleVideoClick}
        />

        {/* Buffering Spinner */}
        {isBuffering && isPlaying && (
          <div className="srp-buffering-overlay">
            <div className="srp-buffering-spinner" />
          </div>
        )}

        {/* Big Play Button (before first play) */}
        {!hasStarted && !isPlaying && (
          <div className="srp-big-play-overlay" onClick={togglePlay}>
            <div className="srp-big-play-btn">
              <Play style={{ width: 36, height: 36, color: 'white', marginLeft: 3 }} fill="white" />
            </div>
            <div className="srp-big-play-ring" />
          </div>
        )}

        {/* Gradient overlay at bottom for controls readability */}
        <div className={`srp-gradient-bottom ${showControls || !isPlaying ? 'srp-visible' : 'srp-hidden'}`} />

        {/* ── Controls Bar ────────────────────────────────────────── */}
        <div className={`srp-controls-wrap ${showControls || !isPlaying ? 'srp-visible' : 'srp-hidden'}`}>
          
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className={`srp-progress-track ${isHoveringProgress || isSeeking ? 'srp-progress-expanded' : ''}`}
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => {
              setIsHoveringProgress(false);
            }}
            onMouseMove={handleProgressHover}
            onMouseDown={handleProgressMouseDown}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Buffered */}
            <div className="srp-progress-buffered" style={{ width: `${bufferedPercent}%` }} />
            {/* Played */}
            <div className="srp-progress-played" style={{ width: `${progressPercent}%` }} />
            {/* Hover indicator */}
            {(isHoveringProgress || isSeeking) && (
              <>
                <div className="srp-progress-hover-line" style={{ left: `${hoverPosition}%` }} />
                <div className="srp-progress-tooltip" style={{ left: `${hoverPosition}%` }}>
                  {formatTime(hoverTime)}
                </div>
              </>
            )}
            {/* Scrubber thumb */}
            <div
              className={`srp-progress-thumb ${isHoveringProgress || isSeeking ? 'srp-thumb-visible' : ''}`}
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Controls Row */}
          <div className="srp-controls-row">
            {/* Left Controls */}
            <div className="srp-controls-left">
              {/* Play/Pause */}
              <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="srp-ctrl-btn" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? (
                  <Pause style={{ width: 22, height: 22 }} fill="white" />
                ) : (
                  <Play style={{ width: 22, height: 22, marginLeft: 2 }} fill="white" />
                )}
              </button>

              {/* Skip Backward */}
              <button onClick={(e) => { e.stopPropagation(); skipBackward(); }} className="srp-ctrl-btn srp-ctrl-btn-sm" title="Rewind 10s">
                <RotateCcw style={{ width: 18, height: 18 }} />
              </button>

              {/* Skip Forward */}
              <button onClick={(e) => { e.stopPropagation(); skipForward(); }} className="srp-ctrl-btn srp-ctrl-btn-sm" title="Forward 10s">
                <RotateCw style={{ width: 18, height: 18 }} />
              </button>

              {/* Volume Group */}
              <div
                className="srp-volume-group"
                onMouseEnter={() => {
                  if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
                  setShowVolumeSlider(true);
                }}
                onMouseLeave={() => {
                  volumeTimeoutRef.current = setTimeout(() => setShowVolumeSlider(false), 300);
                }}
              >
                <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="srp-ctrl-btn srp-ctrl-btn-sm" aria-label={isMuted ? 'Unmute' : 'Mute'}>
                  <VolumeIcon style={{ width: 20, height: 20, color: isMuted ? '#f87171' : 'white' }} />
                </button>
                <div className={`srp-volume-slider-wrap ${showVolumeSlider ? 'srp-vol-visible' : 'srp-vol-hidden'}`}>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    onClick={(e) => e.stopPropagation()}
                    className="srp-volume-slider"
                    style={{
                      background: `linear-gradient(to right, #34d399 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`
                    }}
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="srp-time-display" onClick={(e) => e.stopPropagation()}>
                <span className="srp-time-current">{formatTime(currentTime)}</span>
                <span className="srp-time-sep">/</span>
                <span className="srp-time-total">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="srp-controls-right">
              {/* Speed Control */}
              <div className="srp-speed-group" ref={speedMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeedMenu(!showSpeedMenu);
                  }}
                  className="srp-ctrl-btn srp-speed-btn"
                  title="Playback Speed"
                >
                  {playbackSpeed === 1 ? (
                    <Settings style={{ width: 18, height: 18 }} />
                  ) : (
                    <span className="srp-speed-label">{playbackSpeed}x</span>
                  )}
                </button>
                {showSpeedMenu && (
                  <div className="srp-speed-menu">
                    <div className="srp-speed-menu-title">Playback Speed</div>
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        onClick={(e) => {
                          e.stopPropagation();
                          changeSpeed(speed);
                        }}
                        className={`srp-speed-option ${playbackSpeed === speed ? 'srp-speed-active' : ''}`}
                      >
                        <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                        {playbackSpeed === speed && <span className="srp-speed-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture-in-Picture */}
              <button onClick={(e) => { e.stopPropagation(); togglePiP(); }} className="srp-ctrl-btn srp-ctrl-btn-sm" title="Picture-in-Picture">
                <PictureInPicture2 style={{ width: 18, height: 18 }} />
              </button>

              {/* Fullscreen */}
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="srp-ctrl-btn" aria-label="Fullscreen" title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}>
                {isFullscreen ? (
                  <Minimize style={{ width: 20, height: 20 }} />
                ) : (
                  <Maximize style={{ width: 20, height: 20 }} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Metadata */}
      <div className="srp-metadata">
        {recording.duration > 0 && (
          <span className="srp-meta-item">
            <Clock style={{ width: 14, height: 14 }} />
            {formatTime(recording.duration)}
          </span>
        )}
        {recording.fileSize && recording.fileSize > 0 && (
          <span className="srp-meta-item">
            <Film style={{ width: 14, height: 14 }} />
            {formatFileSize(recording.fileSize)}
          </span>
        )}
        <span className="srp-meta-item" style={{ textTransform: 'capitalize' }}>
          {recording.recordingType.replace(/_/g, ' ')}
        </span>
        {playbackSpeed !== 1 && (
          <span className="srp-meta-item srp-meta-speed">
            {playbackSpeed}x speed
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Wrapper Class Helper ───────────────────────────────────────────────────
function wrapperClass(inline: boolean): string {
  if (inline) return 'srp-wrapper-inline';
  return 'srp-wrapper';
}

// ─── Scoped Styles ──────────────────────────────────────────────────────────
const playerStyles = `
/* ─── Wrapper ──────────────────────────────────────────────── */
.srp-wrapper {
  width: 100%;
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.06);
  background: #000;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
}
.srp-wrapper-inline {
  width: 100%;
  overflow: hidden;
}

/* ─── Video Container ──────────────────────────────────────── */
.srp-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #0a0a0f;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}
.srp-fullscreen {
  border-radius: 0 !important;
}
.srp-fullscreen .srp-video {
  border-radius: 0 !important;
}
.srp-show-cursor { cursor: default; }
.srp-hide-cursor { cursor: none; }

.srp-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #000;
}

/* ─── Gradient Overlay ─────────────────────────────────────── */
.srp-gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 160px;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
  pointer-events: none;
  transition: opacity 0.4s ease;
}

/* ─── Visibility ───────────────────────────────────────────── */
.srp-visible { opacity: 1; }
.srp-hidden { opacity: 0; pointer-events: none; }

/* ─── Big Play Button ──────────────────────────────────────── */
.srp-big-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(2px);
  cursor: pointer;
  z-index: 5;
}
.srp-big-play-btn {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 0 60px rgba(16,185,129,0.4), 0 4px 20px rgba(0,0,0,0.3);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.srp-big-play-overlay:hover .srp-big-play-btn {
  transform: scale(1.12);
  box-shadow: 0 0 80px rgba(16,185,129,0.55), 0 6px 30px rgba(0,0,0,0.3);
}
.srp-big-play-ring {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid rgba(16,185,129,0.3);
  animation: srpPulseRing 2s ease-in-out infinite;
}
@keyframes srpPulseRing {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 0; }
}

/* ─── Buffering Spinner ────────────────────────────────────── */
.srp-buffering-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4;
  pointer-events: none;
}
.srp-buffering-spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.15);
  border-top-color: #34d399;
  animation: srpSpin 0.8s linear infinite;
}

/* ─── Controls Wrap ────────────────────────────────────────── */
.srp-controls-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0 16px 14px 16px;
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.srp-controls-wrap.srp-hidden {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
}
.srp-controls-wrap.srp-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ─── Progress Bar ─────────────────────────────────────────── */
.srp-progress-track {
  position: relative;
  width: 100%;
  height: 5px;
  background: rgba(255,255,255,0.15);
  border-radius: 6px;
  cursor: pointer;
  transition: height 0.2s ease;
  margin-bottom: 10px;
}
.srp-progress-expanded {
  height: 7px;
}
.srp-progress-buffered {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255,255,255,0.18);
  border-radius: 6px;
  transition: width 0.3s ease;
  pointer-events: none;
}
.srp-progress-played {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 6px;
  pointer-events: none;
  box-shadow: 0 0 8px rgba(16,185,129,0.4);
}
.srp-progress-hover-line {
  position: absolute;
  top: -4px;
  width: 2px;
  height: calc(100% + 8px);
  background: rgba(255,255,255,0.5);
  border-radius: 2px;
  transform: translateX(-50%);
  pointer-events: none;
}
.srp-progress-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  transform: translateX(-50%);
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 12px;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  border: 1px solid rgba(255,255,255,0.1);
}
.srp-progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.15s ease;
  pointer-events: none;
  box-shadow: 0 0 12px rgba(16,185,129,0.5), 0 2px 6px rgba(0,0,0,0.3);
}
.srp-thumb-visible {
  transform: translate(-50%, -50%) scale(1) !important;
}

/* ─── Controls Row ─────────────────────────────────────────── */
.srp-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.srp-controls-left,
.srp-controls-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ─── Control Button ───────────────────────────────────────── */
.srp-ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  flex-shrink: 0;
}
.srp-ctrl-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #34d399;
  transform: scale(1.08);
}
.srp-ctrl-btn:active {
  transform: scale(0.95);
}
.srp-ctrl-btn-sm {
  width: 36px;
  height: 36px;
}

/* ─── Volume Slider ────────────────────────────────────────── */
.srp-volume-group {
  display: flex;
  align-items: center;
  gap: 0;
}
.srp-volume-slider-wrap {
  overflow: hidden;
  transition: width 0.3s ease, opacity 0.3s ease;
}
.srp-vol-visible {
  width: 80px;
  opacity: 1;
}
.srp-vol-hidden {
  width: 0;
  opacity: 0;
}
.srp-volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 72px;
  height: 4px;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  margin: 0 4px;
}
.srp-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(0,0,0,0.3);
}
.srp-volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 6px rgba(0,0,0,0.3);
}

/* ─── Time Display ─────────────────────────────────────────── */
.srp-time-display {
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255,255,255,0.9);
  margin-left: 4px;
  user-select: none;
}
.srp-time-sep {
  color: rgba(255,255,255,0.35);
  margin: 0 2px;
}
.srp-time-total {
  color: rgba(255,255,255,0.5);
}

/* ─── Speed Menu ───────────────────────────────────────────── */
.srp-speed-group {
  position: relative;
}
.srp-speed-btn {
  font-size: 13px;
  font-weight: 700;
}
.srp-speed-label {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #34d399;
}
.srp-speed-menu {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 0;
  min-width: 180px;
  background: rgba(15,15,20,0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  z-index: 50;
  animation: srpFadeIn 0.15s ease;
}
.srp-speed-menu-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.4);
  padding: 6px 12px 8px;
}
.srp-speed-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.8);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  outline: none;
}
.srp-speed-option:hover {
  background: rgba(255,255,255,0.08);
  color: white;
}
.srp-speed-active {
  color: #34d399 !important;
  background: rgba(16,185,129,0.1) !important;
}
.srp-speed-check {
  font-size: 14px;
  font-weight: 700;
}

/* ─── Metadata ─────────────────────────────────────────────── */
.srp-metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  background: linear-gradient(to right, rgba(15,15,20,0.95), rgba(20,20,28,0.95));
  border-radius: 0 0 20px 20px;
}
.srp-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.srp-meta-speed {
  color: #34d399;
  font-weight: 600;
}

/* ─── State Screens ────────────────────────────────────────── */
.srp-skeleton {
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #111118, #1a1a24);
  animation: srpPulse 2s ease-in-out infinite;
}
.srp-skeleton-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.srp-skeleton-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52px;
  background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
}
.srp-error-state {
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #111118, #1a1a24);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}
.srp-error-text {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  text-align: center;
  max-width: 320px;
}
.srp-retry-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.srp-retry-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(16,185,129,0.3);
}
.srp-processing-state {
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #111118, #1a1a24);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}
.srp-refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.08);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.srp-refresh-btn:hover {
  background: rgba(255,255,255,0.15);
}
.srp-no-video {
  position: relative;
  aspect-ratio: 16 / 9;
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  background: linear-gradient(135deg, #111118, #1a1a24);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* ─── Animations ───────────────────────────────────────────── */
.srp-spin {
  animation: srpSpin 1s linear infinite;
}
@keyframes srpSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes srpPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
@keyframes srpFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── Responsive ───────────────────────────────────────────── */
@media (max-width: 640px) {
  .srp-controls-wrap {
    padding: 0 10px 10px 10px;
  }
  .srp-ctrl-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
  }
  .srp-ctrl-btn-sm {
    width: 30px;
    height: 30px;
  }
  .srp-time-display {
    font-size: 11px;
  }
  .srp-metadata {
    padding: 10px 14px;
    font-size: 11px;
    gap: 10px;
  }
  .srp-big-play-btn {
    width: 64px;
    height: 64px;
  }
  .srp-big-play-ring {
    width: 84px;
    height: 84px;
  }
  .srp-vol-visible {
    width: 60px;
  }
  .srp-volume-slider {
    width: 52px;
  }
}

/* ─── Fullscreen Overrides ─────────────────────────────────── */
.srp-fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  aspect-ratio: unset !important;
  max-width: none !important;
  max-height: none !important;
}
.srp-fullscreen .srp-controls-wrap {
  padding: 0 32px 24px 32px;
}
.srp-fullscreen .srp-progress-track {
  height: 6px;
}
.srp-fullscreen .srp-progress-expanded {
  height: 9px;
}
`;
