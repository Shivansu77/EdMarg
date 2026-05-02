'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Monitor, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import RecordingBadge from './RecordingBadge';
import {
  uploadRecording,
  type UploadProgressEvent,
  type UploadStage,
} from '@/utils/uploadRecording';

type RecordingState = 'idle' | 'preparing' | 'recording' | 'uploading' | 'success' | 'error';

interface ScreenRecorderProps {
  sessionId: string;
  onComplete?: () => void;
  onClose?: () => void;
}

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':');
};

const isScreenCaptureSupported = () =>
  typeof navigator !== 'undefined' &&
  typeof window !== 'undefined' &&
  navigator.mediaDevices &&
  typeof navigator.mediaDevices.getDisplayMedia === 'function';

const isFirefox = () =>
  typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

const isSafari = () =>
  typeof navigator !== 'undefined' &&
  /safari/i.test(navigator.userAgent) &&
  !/chrome/i.test(navigator.userAgent);

/** Pick the best supported MIME type for MediaRecorder */
const pickMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') return 'video/webm';
  const candidates = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return 'video/webm';
};

/** Try to get mic stream with a timeout so it never hangs */
const requestMicWithTimeout = async (timeoutMs = 5000): Promise<MediaStream | null> => {
  try {
    const micPromise = navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );

    return await Promise.race([micPromise, timeoutPromise]);
  } catch (err) {
    console.warn('[ScreenRecorder] Mic access denied or unavailable:', err);
    return null;
  }
};

export default function ScreenRecorder({ sessionId, onComplete, onClose }: ScreenRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<UploadStage>('preparing');
  const [errorMsg, setErrorMsg] = useState('');
  const [blobSize, setBlobSize] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blobRef = useRef<Blob | null>(null);

  const stopActiveStreams = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;

    displayStreamRef.current?.getTracks().forEach((track) => track.stop());
    displayStreamRef.current = null;

    micStreamRef.current?.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;

    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopActiveStreams();
    };
  }, [stopActiveStreams]);

  const handleUpload = useCallback(async (blob: Blob) => {
    const sizeMB = blob.size / (1024 * 1024);

    if (sizeMB > 500) {
      setErrorMsg(`Recording is too large (${sizeMB.toFixed(0)} MB). Maximum is 500 MB.`);
      setState('error');
      return;
    }

    if (sizeMB > 100) {
      toast(`Large file (${sizeMB.toFixed(0)} MB). Upload may take a while.`, { icon: '⚠️', duration: 5000 });
    }

    setState('uploading');
    setProgress(0);
    setUploadStage('preparing');

    try {
      const file = new File([blob], `session-${sessionId}-${Date.now()}.webm`, { type: blob.type });

      await uploadRecording(sessionId, file, (event: UploadProgressEvent) => {
        setProgress(event.percent);
        setUploadStage(event.stage);
      });

      setState('success');
      toast.success('Recording uploaded! Student has been notified.');
      setTimeout(() => onComplete?.(), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed.');
      setState('error');
      toast.error('Upload failed. You can retry.');
    }
  }, [onComplete, sessionId]);

  /**
   * IMPORTANT: getDisplayMedia MUST be called synchronously from the click
   * handler to preserve the "user gesture / transient activation" context.
   * Any setState before await will cause React to re-render and the browser
   * will reject the getDisplayMedia call or not show the picker.
   *
   * Flow: click → getDisplayMedia (browser picker opens) → user picks screen
   *       → then we set state to 'preparing' while we set up mic & recorder.
   */
  const startRecording = useCallback(async () => {
    // Pre-checks (all sync — no state changes before getDisplayMedia)
    if (!isScreenCaptureSupported()) {
      toast.error('Screen recording is not supported in this browser. Please use Chrome, Edge, or Firefox.');
      return;
    }
    if (isFirefox()) {
      toast('Firefox may not capture system audio. Use Chrome or Edge for best results.', { icon: '⚠️', duration: 5000 });
    }

    // ── Step 1: Get screen share IMMEDIATELY (preserves user gesture) ──
    // DO NOT call setState before this — it will break the user gesture chain.
    let displayStream: MediaStream;
    try {
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
    } catch (firstErr) {
      if ((firstErr as DOMException).name === 'NotAllowedError') {
        toast.error('Screen sharing was cancelled.');
        return;
      }
      // Some browsers don't support audio in getDisplayMedia — retry video-only
      console.warn('[ScreenRecorder] Retrying without audio:', firstErr);
      try {
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
      } catch (secondErr) {
        if ((secondErr as DOMException).name === 'NotAllowedError') {
          toast.error('Screen sharing was cancelled.');
          return;
        }
        console.error('[ScreenRecorder] getDisplayMedia failed:', secondErr);
        toast.error('Failed to start screen capture. Please try again.');
        return;
      }
    }

    // User has selected a screen/window — now show "preparing" state
    setState('preparing');
    displayStreamRef.current = displayStream;

    const videoTrack = displayStream.getVideoTracks()[0];
    if (!videoTrack) {
      displayStream.getTracks().forEach((t) => t.stop());
      setState('idle');
      toast.error('No video track found. Please try again.');
      return;
    }

    try {
      // ── Step 2: Get mic (AFTER screen share is confirmed) with timeout ──
      const micStream = await requestMicWithTimeout(5000);
      micStreamRef.current = micStream;

      // ── Step 3: Mix audio tracks ──
      const displayAudioTracks = displayStream.getAudioTracks();
      const micAudioTracks = micStream?.getAudioTracks() || [];
      let audioContext: AudioContext | null = null;
      let mixedAudioTrack: MediaStreamTrack | null = null;

      if (displayAudioTracks.length > 0 || micAudioTracks.length > 0) {
        try {
          audioContext = new AudioContext();
          const destination = audioContext.createMediaStreamDestination();

          if (displayAudioTracks.length > 0) {
            const displayAudioSource = audioContext.createMediaStreamSource(
              new MediaStream(displayAudioTracks)
            );
            displayAudioSource.connect(destination);
          }

          if (micAudioTracks.length > 0) {
            const micAudioSource = audioContext.createMediaStreamSource(
              new MediaStream(micAudioTracks)
            );
            const micGain = audioContext.createGain();
            // Lower mic volume when display audio is present to prevent
            // echo/feedback from the mic picking up speaker output
            micGain.gain.value = displayAudioTracks.length > 0 ? 0.5 : 1.0;
            micAudioSource.connect(micGain);
            micGain.connect(destination);
          }

          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          mixedAudioTrack = destination.stream.getAudioTracks()[0] || null;
        } catch (audioErr) {
          console.warn('[ScreenRecorder] Audio mixing failed, proceeding without audio:', audioErr);
        }
      }

      audioContextRef.current = audioContext;

      // ── Step 4: Build the recording stream ──
      const recordingTracks: MediaStreamTrack[] = [videoTrack];
      if (mixedAudioTrack) {
        recordingTracks.push(mixedAudioTrack);
      }
      const recordingStream = new MediaStream(recordingTracks);
      recordingStreamRef.current = recordingStream;

      if (displayAudioTracks.length === 0) {
        toast('Screen audio was not detected. Only your microphone (if any) will be recorded.', { icon: '⚠️' });
      }

      // ── Step 5: Create and start MediaRecorder ──
      const mimeType = pickMimeType();

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(recordingStream, { mimeType });
      } catch {
        recorder = new MediaRecorder(recordingStream);
      }
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const actualMime = recorder.mimeType || mimeType;
        const blob = new Blob(chunksRef.current, { type: actualMime });
        blobRef.current = blob;
        setBlobSize(blob.size);
        stopActiveStreams();
        handleUpload(blob);
      };

      recorder.onerror = (e) => {
        console.error('[ScreenRecorder] MediaRecorder error:', e);
        stopActiveStreams();
        setState('error');
        setErrorMsg('Recording encountered an error. Please try again.');
        toast.error('Recording failed.');
      };

      // Auto-stop when user stops sharing via browser controls
      videoTrack.addEventListener('ended', () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      });

      recorder.start(1000);
      setState('recording');
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
      toast.success('Recording started!');
    } catch (err) {
      console.error('[ScreenRecorder] Failed to start recording:', err);
      stopActiveStreams();
      setState('idle');
      toast.error('Failed to start recording. Please try again.');
    }
  }, [handleUpload, stopActiveStreams]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleRetry = () => {
    if (blobRef.current) {
      handleUpload(blobRef.current);
    }
  };

  const handleReset = () => {
    setState('idle');
    setElapsed(0);
    setProgress(0);
    setUploadStage('preparing');
    setBlobSize(0);
    setErrorMsg('');
    blobRef.current = null;
    chunksRef.current = [];
  };

  // ── Styles ──────────────────────────────────────────────────────────────
  const s = {
    overlay: { position: 'fixed' as const, inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', padding: 20 },
    modal: { background: '#fff', borderRadius: 20, boxShadow: '0 24px 80px rgba(0,0,0,0.18)', width: '100%', maxWidth: 480, overflow: 'hidden' as const, animation: 'sr-fadein 0.3s ease-out' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' },
    title: { fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 },
    subtitle: { fontSize: 13, color: '#64748b', margin: '2px 0 0', fontWeight: 500 },
    close: { width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    body: { padding: 24 },
    center: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 16, textAlign: 'center' as const, padding: '16px 0' },
    btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 24px', fontSize: 14, fontWeight: 700, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' },
    btnOutline: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px 24px', fontSize: 14, fontWeight: 700, color: '#475569', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit' },
    track: { width: '100%', height: 8, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' as const },
    fill: { height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#10b981,#059669)', transition: 'width 0.3s ease' },
  };

  const showModal = state !== 'recording';
  const canClose = state === 'idle' || state === 'success' || state === 'error';

  return (
    <>
      {/* Floating badge while recording */}
      {state === 'recording' && <RecordingBadge elapsed={formatTime(elapsed)} onStop={stopRecording} />}

      {showModal && (
        <div style={s.overlay} onClick={canClose ? onClose : undefined}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={s.header}>
              <div>
                <h2 style={s.title}>Screen Recording</h2>
                <p style={s.subtitle}>Record your session screen</p>
              </div>
              {canClose && onClose && (
                <button onClick={onClose} style={s.close}><X size={18} /></button>
              )}
            </div>

            {/* Body */}
            <div style={s.body}>
              {/* IDLE */}
              {state === 'idle' && (
                <div style={s.center}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Monitor size={28} color="#ef4444" />
                  </div>
                  <p style={{ fontSize: 14, color: '#64748b', maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
                    Click below to choose what to record. You can pick any app window or your entire screen. For audio, Chrome or Edge works best.
                  </p>
                  {!isScreenCaptureSupported() && (
                    <div style={{ padding: '10px 16px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
                      Screen recording is not supported in this browser. Please use Chrome or Edge.
                    </div>
                  )}
                  <button
                    onClick={startRecording}
                    disabled={!isScreenCaptureSupported()}
                    style={{ ...s.btnPrimary, background: '#ef4444', boxShadow: '0 4px 14px rgba(239,68,68,0.25)', opacity: isScreenCaptureSupported() ? 1 : 0.5 }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
                    Start Recording
                  </button>
                  {isSafari() && (
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                      ⚠️ Safari has limited recording support. For best results, use Chrome or Edge.
                    </p>
                  )}
                </div>
              )}

              {/* PREPARING – screen share confirmed, setting up mic & recorder */}
              {state === 'preparing' && (
                <div style={s.center}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 size={28} color="#3b82f6" style={{ animation: 'sr-spin 1s linear infinite' }} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Setting up recorder...
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748b', maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
                    Configuring audio and preparing to record. This will only take a moment.
                  </p>
                </div>
              )}

              {/* UPLOADING */}
              {state === 'uploading' && (
                <div style={s.center}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Uploading recording...</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
                  </div>
                  <div style={s.track}>
                    <div style={{ ...s.fill, width: `${progress}%` }} />
                  </div>
                  <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: 0 }}>
                    {blobSize > 0 ? `${(blobSize / 1024 / 1024).toFixed(1)} MB · ` : ''}
                    {uploadStage === 'preparing'
                      ? 'Preparing secure upload...'
                      : uploadStage === 'finalizing'
                        ? 'Saving recording details...'
                        : 'Uploading directly to cloud storage. Please keep this window open.'}
                  </p>
                </div>
              )}

              {/* SUCCESS */}
              {state === 'success' && (
                <div style={s.center}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={36} color="#10b981" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Recording Saved!</h3>
                  <p style={{ fontSize: 14, color: '#64748b', maxWidth: 320, lineHeight: 1.6, margin: 0 }}>
                    Your recording has been uploaded and the student has been notified.
                  </p>
                  <button onClick={onClose} style={{ ...s.btnPrimary, background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }}>
                    Done
                  </button>
                </div>
              )}

              {/* ERROR */}
              {state === 'error' && (
                <div style={s.center}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle size={36} color="#ef4444" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>Upload Failed</h3>
                  <p style={{ fontSize: 13, color: '#991b1b', fontWeight: 600, margin: 0 }}>{errorMsg}</p>
                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    {blobSize > 0 && (
                      <button onClick={handleRetry} style={{ ...s.btnPrimary, background: '#ef4444', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}>
                        Retry Upload
                      </button>
                    )}
                    <button onClick={handleReset} style={s.btnOutline}>
                      Start Over
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {state === 'idle' && (
              <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
                <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: 0, textAlign: 'center' }}>
                  🎬 You can record any window or the full screen. If you need meeting audio, turn audio on in the share dialog.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes sr-fadein {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sr-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
