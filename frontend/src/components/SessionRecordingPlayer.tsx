'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '@/utils/api-client';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  AlertCircle,
  Loader2,
  Clock,
  Film,
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
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
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

// ─── Component ──────────────────────────────────────────────────────────────
export default function SessionRecordingPlayer({
  sessionId,
  inline = false,
}: SessionRecordingPlayerProps) {
  const [recording, setRecording] = useState<RecordingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // ─── Video Controls ───────────────────────────────────────────────────
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      const p = videoRef.current.play();
      if (p !== undefined) {
        playPromiseRef.current = p;
        p.catch(() => {
          // Ignore AbortError: The play() request was interrupted by a call to pause().
        }).finally(() => {
          playPromiseRef.current = null;
        });
      }
      setIsPlaying(true);
    } else {
      if (playPromiseRef.current) {
        // Wait for play to finish before pausing
        playPromiseRef.current.then(() => {
          videoRef.current?.pause();
          setIsPlaying(false);
        }).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Prevent right-click on the video
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // ─── Loading Skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={wrapperClass(inline)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900/80 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={wrapperClass(inline)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900/90 flex flex-col items-center justify-center gap-4 p-6">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p className="text-sm text-gray-300 text-center max-w-xs">{error}</p>
          <button
            onClick={fetchRecording}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Processing State ─────────────────────────────────────────────────
  if (recording && recording.processingStatus !== 'completed') {
    const statusMessages: Record<string, { label: string; color: string }> = {
      pending: { label: 'Recording is queued for processing...', color: 'text-amber-400' },
      downloading: { label: 'Downloading recording from Zoom...', color: 'text-blue-400' },
      uploading: { label: 'Uploading to secure storage...', color: 'text-emerald-400' },
      failed: { label: 'Processing failed. Please contact support.', color: 'text-red-400' },
    };
    const status = statusMessages[recording.processingStatus] || statusMessages.pending;

    return (
      <div className={wrapperClass(inline)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900/90 flex flex-col items-center justify-center gap-4 p-6">
          {recording.processingStatus !== 'failed' ? (
            <Loader2 className={`h-10 w-10 animate-spin ${status.color}`} />
          ) : (
            <AlertCircle className={`h-10 w-10 ${status.color}`} />
          )}
          <p className={`text-sm font-medium ${status.color}`}>{status.label}</p>
          {recording.processingStatus !== 'failed' && (
            <button
              onClick={fetchRecording}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/20 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
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
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900/90 flex items-center justify-center">
          <p className="text-sm text-gray-400">No recording available</p>
        </div>
      </div>
    );
  }

  // ─── Video Player ─────────────────────────────────────────────────────
  return (
    <div className={wrapperClass(inline)}>
      {/* Video Container */}
      <div
        className="group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onContextMenu={handleContextMenu}
      >
        <video
          ref={videoRef}
          src={recording.videoUrl}
          className="h-full w-full object-contain"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setShowControls(true);
          }}
          onClick={togglePlay}
        />

        {/* Play overlay (shown when paused) */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-all duration-300"
            onClick={togglePlay}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/90 shadow-[0_0_40px_rgba(16,185,129,0.4)] backdrop-blur-md transition-transform hover:scale-110 hover:bg-emerald-400">
              <Play className="h-8 w-8 text-white ml-1.5" fill="white" />
            </div>
          </div>
        )}

        {/* Premium Custom Controls */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-10 transition-all duration-500 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-2 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
            {/* Progress Bar */}
            <div className="relative group flex items-center h-4 w-full">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step="any"
                value={currentTime || 0}
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  if (videoRef.current && isFinite(newTime)) {
                    videoRef.current.currentTime = newTime;
                    setCurrentTime(newTime);
                  }
                }}
                className="absolute w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)] [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:opacity-0 group-hover:[&::-moz-range-thumb]:opacity-100 [&::-moz-range-thumb]:transition-opacity"
                style={{
                  background: `linear-gradient(to right, #10b981 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%)`
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-emerald-400 hover:scale-110 transition-all focus:outline-none"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" fill="white" />
                  ) : (
                    <Play className="h-5 w-5" fill="white" />
                  )}
                </button>

                {/* Mute */}
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-emerald-400 hover:scale-110 transition-all focus:outline-none"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-red-400" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>

                {/* Time */}
                <div className="text-xs font-medium tracking-wide text-white/90 font-mono bg-white/10 px-2 py-1 rounded-md">
                  {formatDuration(currentTime)} <span className="text-white/50 mx-1">/</span> {formatDuration(duration)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Skip Buttons */}
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      const t = Math.max(0, videoRef.current.currentTime - 10);
                      videoRef.current.currentTime = t;
                      setCurrentTime(t);
                    }
                  }}
                  className="text-white hover:text-emerald-400 transition-colors focus:outline-none"
                  title="Rewind 10s"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-emerald-400 hover:scale-110 transition-all focus:outline-none"
                  aria-label="Fullscreen"
                >
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        {recording.duration > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(recording.duration)}
          </span>
        )}
        {recording.fileSize && recording.fileSize > 0 && (
          <span className="flex items-center gap-1">
            <Film className="h-3.5 w-3.5" />
            {formatFileSize(recording.fileSize)}
          </span>
        )}
        <span className="flex items-center gap-1 capitalize">
          {recording.recordingType.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
}

// ─── Wrapper Class Helper ───────────────────────────────────────────────────
function wrapperClass(inline: boolean): string {
  if (inline) return 'w-full';
  return 'w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm';
}
