'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import Logo from '@/components/Logo';
import { ArrowLeft, Clock, Film, AlertCircle, RefreshCcw, Video } from 'lucide-react';

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
            <div className="bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <video
                ref={videoRef}
                src={recording.videoUrl}
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
                className="w-full max-h-[70vh] outline-none"
              >
                Your browser does not support the video tag.
              </video>
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
