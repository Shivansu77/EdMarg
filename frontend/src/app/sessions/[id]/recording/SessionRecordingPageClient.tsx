'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import AuthRecovery from '@/components/common/AuthRecovery';
import Logo from '@/components/common/Logo';
import ReactPlayer from 'react-player';
import RecordingUploader from '@/components/RecordingUploader';
import { 
  ArrowLeft, 
  Clock, 
  Film, 
  AlertCircle, 
  RefreshCcw, 
  Video, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  Upload,
  Trash2,
  User
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Clip {
  _id: string | null;
  title: string;
  videoUrl: string;
  duration: number;
  fileSize: number;
  order: number;
  uploadedByRole: 'student' | 'mentor' | 'admin' | 'system';
  source: 'zoom' | 'screen_recording' | 'manual_upload' | 'student_upload';
  createdAt: string | null;
}

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
  clips: Clip[];
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
  const [showUploader, setShowUploader] = useState(false);
  
  // Multi-video timeline state
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);

  // react-player v3 exposes the underlying media element via `ref`, so this is
  // a plain <video>, not a v2-style player wrapper with a `seekTo()` method.
  const playerRef = useRef<HTMLVideoElement | null>(null);
  // A seek that targets a different clip cannot be applied until that clip's
  // source has loaded, so it is parked here and replayed on `loadedmetadata`.
  const pendingSeekRef = useRef<number | null>(null);


  const clips = recording?.clips || [];
  const currentClip = clips[currentClipIndex];
  const hasMultipleClips = clips.length > 1;

  // Calculate timeline position across all clips
  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);
  const clipStartTimes = clips.reduce((acc, clip, i) => {
    acc[i] = i === 0 ? 0 : acc[i - 1] + clips[i - 1].duration;
    return acc;
  }, {} as Record<number, number>);
  
  const globalPlayedSeconds = clipStartTimes[currentClipIndex] + playedSeconds;
  const progressPercent = totalDuration > 0 ? (globalPlayedSeconds / totalDuration) * 100 : 0;

  // Player Handlers
  const handlePlayPause = () => setPlaying(!playing);
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleToggleMute = () => setMuted(!muted);

  const handleFullscreen = () => {
    const wrapper = document.querySelector('.player-wrapper');
    if (wrapper) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        wrapper.requestFullscreen();
      }
    }
  };

  /** Seek the underlying <video>; v3 has no `seekTo`, so set `currentTime`. */
  const seekCurrentClipTo = (seconds: number) => {
    const player = playerRef.current;
    if (player) {
      player.currentTime = seconds;
    }
    setPlayedSeconds(seconds);
  };

  const handleSkipBackward = () => {
    seekCurrentClipTo(Math.max(0, playedSeconds - 10));
  };

  /**
   * v3 replaced the polled `onProgress` callback with the native `timeupdate`
   * event, which reports position through the element rather than an argument.
   */
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setPlayedSeconds(e.currentTarget.currentTime);
  };

  /**
   * Apply a seek that was requested for a clip that had not loaded yet. Seeking
   * before `loadedmetadata` is silently discarded by the browser.
   */
  const handleLoadedMetadata = () => {
    const pendingSeek = pendingSeekRef.current;
    if (pendingSeek === null) return;

    pendingSeekRef.current = null;
    seekCurrentClipTo(pendingSeek);
  };


  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const targetSeconds = percent * totalDuration;

    // Find which clip this time lands in
    let targetClipIndex = 0;
    let targetClipTime = 0;

    for (let i = 0; i < clips.length; i++) {
      const clipStart = clipStartTimes[i];
      const clipEnd = clipStart + clips[i].duration;
      
      if (targetSeconds >= clipStart && targetSeconds < clipEnd) {
        targetClipIndex = i;
        targetClipTime = targetSeconds - clipStart;
        break;
      }
    }

    // Switch clip if needed
    if (targetClipIndex !== currentClipIndex) {
      setCurrentClipIndex(targetClipIndex);
      setPlayedSeconds(0);
      // The new clip's source has not loaded yet; park the seek until
      // `loadedmetadata` fires on the <video> element.
      pendingSeekRef.current = targetClipTime;
    } else {
      seekCurrentClipTo(targetClipTime);
    }
  };


  const handleClipEnd = () => {
    if (currentClipIndex < clips.length - 1) {
      // Auto-advance to next clip
      setCurrentClipIndex(currentClipIndex + 1);
      setPlayedSeconds(0);
    } else {
      // End of all clips
      setPlaying(false);
    }
  };

  const switchToClip = (index: number) => {
    if (index >= 0 && index < clips.length) {
      setCurrentClipIndex(index);
      setPlayedSeconds(0);
      setPlaying(true);
    }
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

      if (rec.processingStatus === 'completed' && rec.clips && rec.clips.length > 0) {
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

  const handleUploadComplete = () => {
    setShowUploader(false);
    handleRetry();
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

  const canUpload = user?.role === 'mentor' || user?.role === 'student' || user?.role === 'admin';

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
            <div className="flex items-center gap-4">
              {state === 'ready' && canUpload && (
                <button
                  onClick={() => setShowUploader(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Part</span>
                </button>
              )}
              <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-500" />
                Session Recording
              </div>
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
            {canUpload && (
              <button
                onClick={() => setShowUploader(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors mb-4"
              >
                <Upload className="w-4 h-4" />
                Upload Recording
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors ml-3"
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

        {state === 'ready' && recording && currentClip && (
          <div className="space-y-6">
            {/* Video Player */}
            <div className="player-wrapper relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <ReactPlayer
                ref={playerRef}
                src={currentClip.videoUrl}
                playing={playing}
                volume={volume}
                muted={muted}
                width="100%"
                height="100%"
                className="react-player"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleClipEnd}
                onLoadedMetadata={handleLoadedMetadata}
                style={{ aspectRatio: '16/9' }}
                playsInline

              />


              {/* Custom Controls Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 pointer-events-auto">
                  {/* Progress Bar */}
                  <div
                    className="h-2 bg-white/20 rounded-full cursor-pointer group/seek relative"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity" />
                    </div>
                    {/* Clip markers */}
                    {hasMultipleClips && clips.map((clip, idx) => {
                      if (idx === 0) return null;
                      const markerPos = (clipStartTimes[idx] / totalDuration) * 100;
                      return (
                        <div
                          key={idx}
                          className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                          style={{ left: `${markerPos}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handlePlayPause}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {playing ? <Pause className="w-5 h-5" fill="white" /> : <Play className="w-5 h-5 ml-0.5" fill="white" />}
                      </button>
                      <button
                        onClick={handleSkipBackward}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleToggleMute}
                        className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      />
                      <span className="text-sm font-medium tabular-nums">
                        {formatTime(globalPlayedSeconds)} / {formatTime(totalDuration)}
                      </span>
                    </div>

                    <button
                      onClick={handleFullscreen}
                      className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-clip Timeline */}
            {hasMultipleClips && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-emerald-500" />
                  Timeline ({clips.length} parts)
                </h3>
                <div className="space-y-2">
                  {clips.map((clip, idx) => (
                    <div
                      key={clip._id || idx}
                      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
                        idx === currentClipIndex
                          ? 'bg-emerald-50 border-2 border-emerald-500'
                          : 'bg-slate-50 border-2 border-transparent hover:border-slate-300'
                      }`}
                      onClick={() => switchToClip(idx)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          idx === currentClipIndex ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{clip.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(clip.duration)}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {clip.uploadedByRole}
                          </span>
                        </div>
                      </div>
                      {idx === currentClipIndex && playing && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                    Total Duration
                  </p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    {formatTime(totalDuration)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Parts
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {clips.length} video{clips.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {recording.fileSize > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                      Total Size
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

      {/* Upload Modal */}
      {showUploader && (
        <RecordingUploader
          sessionId={sessionId}
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
}
