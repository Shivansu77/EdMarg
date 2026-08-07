'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import AuthRecovery from '@/components/common/AuthRecovery';
import Logo from '@/components/common/Logo';
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
export default function SessionRecordingPageClient() {
  const params = useParams();
  const router = useRouter();
  const {
    user,
    isLoading: authLoading,
    isSignedIn,
    profileError,
    refreshUser,
  } = useAuth();
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

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const skipBackward = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    const handleMouseMove = () => resetControlsTimeout();
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const fetchRecording = async () => {
      if (!sessionId) {
        setState('error');
        setErrorMessage('No session ID provided');
        return;
      }

      setState('loading');
      const res = await apiClient.get<RecordingData>(
        `/api/v1/recordings/${sessionId}`
      );

      if (!res.success || !res.data) {
        if (res.error?.includes('not found')) {
          setState('not_found');
        } else {
          setState('error');
          setErrorMessage(res.error || 'Failed to load recording');
        }
        return;
      }

      const rec = res.data;
      setRecording(rec);

      if (rec.processingStatus === 'completed' && rec.videoUrl) {
        setState('ready');
      } else if (rec.processingStatus === 'processing' || rec.processingStatus === 'pending') {
        setState('processing');
      } else {
        setState('error');
        setErrorMessage('Recording is not available');
      }
    };

    fetchRecording();
  }, [sessionId]);

  const handleRetry = () => {
    setErrorMessage('');
    window.location.reload();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || profileError) {
    return <AuthRecovery onRetry={refreshUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <Logo />
            </div>
            <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-500" />
              Session Recording
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state === 'loading' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="inline-block w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Loading Recording</h2>
            <p className="text-sm text-slate-500">Please wait while we fetch your session recording...</p>
          </div>
        )}

        {state === 'not_found' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Recording Not Found</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              The recording for this session is not available yet. It may still be processing, or the session may not have been recorded.
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {state === 'processing' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6">
              <Film className="w-10 h-10 text-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Recording Is Processing</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Your session recording is being processed. This usually takes a few minutes after the session ends. Please check back shortly.
            </p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Error Loading Recording</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {errorMessage || 'An error occurred while loading the recording. Please try again.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {state === 'ready' && recording && recording.videoUrl && (
          <div className="space-y-6">
            {/* Video Player */}
            <div
              className="relative bg-black rounded-2xl overflow-hidden shadow-2xl group"
              onMouseMove={resetControlsTimeout}
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={recording.videoUrl}
                className="w-full aspect-video"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Custom Controls Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 ${
                  showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Center Play Button */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="w-20 h-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
                    >
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </button>
                  </div>
                )}

                {/* Bottom Controls Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                  {/* Progress Bar */}
                  <div
                    className="h-1.5 bg-white/20 rounded-full cursor-pointer group/seek"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-emerald-500 rounded-full relative transition-all group-hover/seek:bg-emerald-400"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" fill="white" /> : <Play className="w-5 h-5 ml-0.5" fill="white" />}
                      </button>
                      <button
                        onClick={skipBackward}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={toggleMute}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <span className="text-sm font-medium tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recording Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-emerald-500" />
                Recording Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recording.mentorName && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Mentor
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{recording.mentorName}</p>
                  </div>
                )}

                {recording.sessionDate && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(recording.sessionDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Duration
                  </p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    {recording.duration} min
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
