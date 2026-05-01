'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import Logo from '@/components/Logo';
import { ArrowLeft, Clock, Film, AlertCircle, RefreshCcw, Video, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

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
  
  // Custom Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Player Handlers
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

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Logo />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-100">
            <Video className="w-4 h-4" />
            Session Recording
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Title */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Watch Recording
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This recording is securely stored and only accessible by session participants.
          </p>
        </div>

        {/* ─── LOADING STATE ────────────────────────────────────────────── */}
        {state === 'loading' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-pulse">
            <div className="w-full aspect-video bg-slate-100 rounded-xl mb-6" />
            <div className="h-6 bg-slate-100 rounded w-1/3 mb-4" />
            <div className="h-4 bg-slate-100 rounded w-1/4" />
          </div>
        )}

        {/* ─── PROCESSING STATE ─────────────────────────────────────────── */}
        {state === 'processing' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
              <RefreshCcw className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Recording is Being Processed</h2>
            <p className="text-slate-500 max-w-md mb-8">
              Your session recording is currently being uploaded and processed. This usually takes 2–5 minutes. Please check back shortly.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 mb-8">
              {recording?.processingStatus === 'downloading'
                ? 'Downloading from Zoom...'
                : recording?.processingStatus === 'uploading'
                ? 'Uploading to cloud...'
                : 'Queued for processing...'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        )}

        {/* ─── NOT FOUND STATE ──────────────────────────────────────────── */}
        {state === 'not_found' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <Video className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Recording Not Available</h2>
            <p className="text-slate-500 max-w-md mb-8">
              {errorMessage || 'The recording for this session is not available. It may still be processing or the session has not been conducted yet.'}
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {/* ─── ERROR STATE ──────────────────────────────────────────────── */}
        {state === 'error' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something Went Wrong</h2>
            <p className="text-slate-500 max-w-md mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ─── READY STATE — VIDEO PLAYER ───────────────────────────────── */}
        {state === 'ready' && recording?.videoUrl && (
          <div className="space-y-6">
            <div 
              className="group relative bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-video w-full"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <video
                ref={videoRef}
                src={recording.videoUrl}
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                playsInline
                className="w-full h-full object-contain outline-none"
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
              >
                Your browser does not support the video tag.
              </video>

              {/* Play overlay (shown when paused) */}
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-all duration-300"
                  onClick={togglePlay}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/90 shadow-[0_0_50px_rgba(16,185,129,0.5)] backdrop-blur-md transition-transform hover:scale-110 hover:bg-emerald-400">
                    <Play className="h-10 w-10 text-white ml-2" fill="white" />
                  </div>
                </div>
              )}

              {/* Premium Custom Controls */}
              <div
                className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-10 transition-all duration-500 ${
                  showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                <div className="flex flex-col gap-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
                  {/* Progress Bar */}
                  <div className="relative group flex items-center h-5 w-full">
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
                      className="absolute w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,255,255,0.8)] [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:opacity-0 group-hover:[&::-moz-range-thumb]:opacity-100 [&::-moz-range-thumb]:transition-opacity"
                      style={{
                        background: `linear-gradient(to right, #10b981 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%)`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-5">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-emerald-400 hover:scale-110 transition-all focus:outline-none"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6" fill="white" />
                        ) : (
                          <Play className="h-6 w-6" fill="white" />
                        )}
                      </button>

                      {/* Mute */}
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-emerald-400 hover:scale-110 transition-all focus:outline-none"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? (
                          <VolumeX className="h-6 w-6 text-red-400" />
                        ) : (
                          <Volume2 className="h-6 w-6" />
                        )}
                      </button>

                      {/* Time */}
                      <div className="text-sm font-medium tracking-wide text-white/90 font-mono bg-white/10 px-3 py-1.5 rounded-lg border border-white/5">
                        {formatDuration(currentTime)} <span className="text-white/40 mx-1">/</span> {formatDuration(duration)}
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      {/* Skip Buttons */}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            const t = Math.max(0, videoRef.current.currentTime - 10);
                            videoRef.current.currentTime = t;
                            setCurrentTime(t);
                          }
                        }}
                        className="text-white hover:text-emerald-400 hover:scale-110 transition-all focus:outline-none bg-white/5 p-2 rounded-full"
                        title="Rewind 10s"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="text-white hover:text-emerald-400 hover:scale-110 transition-all focus:outline-none bg-white/5 p-2 rounded-full"
                        aria-label="Fullscreen"
                      >
                        <Maximize className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-wrap gap-8 items-center justify-between">
              <div className="flex gap-8 flex-wrap">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Duration
                  </p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    {formatDuration(recording.duration)}
                  </p>
                </div>
                
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Recorded On
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatDate(recording.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Type
                  </p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">
                    {(recording.recordingType || 'video').replace(/_/g, ' ')}
                  </p>
                </div>

                {recording.fileSize > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      File Size
                    </p>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-emerald-500" />
                      {formatFileSize(recording.fileSize)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
