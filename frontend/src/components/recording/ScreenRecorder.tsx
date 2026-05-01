'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Monitor, Square, CheckCircle2, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import RecordingBadge from './RecordingBadge';
import {
  uploadRecording,
  type UploadProgressEvent,
  type UploadStage,
} from '@/utils/uploadRecording';

type RecordingState = 'idle' | 'recording' | 'uploading' | 'success' | 'error';

interface ScreenRecorderProps {
  sessionId: string;
  onComplete?: () => void;
  onClose?: () => void;
}

type DisplayMediaStreamOptionsWithHints = DisplayMediaStreamOptions & {
  selfBrowserSurface?: 'include' | 'exclude';
  surfaceSwitching?: 'include' | 'exclude';
  systemAudio?: 'include' | 'exclude';
  windowAudio?: 'exclude' | 'window' | 'system';
  monitorTypeSurfaces?: 'include' | 'exclude';
};

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':');
};

const isScreenCaptureSupported = () =>
  typeof navigator !== 'undefined' &&
  navigator.mediaDevices &&
  typeof navigator.mediaDevices.getDisplayMedia === 'function';

const isFirefox = () =>
  typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);

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

  const buildRecordingStream = useCallback(async () => {
    const preferredDisplayOptions: DisplayMediaStreamOptionsWithHints = {
      video: { frameRate: 30 },
      audio: true,
      // Browser-specific hints: when supported these increase the chance of
      // capturing shared audio instead of a silent window-only stream,
      // without biasing the picker toward the current tab.
      surfaceSwitching: 'include',
      systemAudio: 'include',
      windowAudio: 'system',
      monitorTypeSurfaces: 'include',
    };

    let displayStream: MediaStream;
    try {
      displayStream = await navigator.mediaDevices.getDisplayMedia(preferredDisplayOptions);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || '');
      const shouldRetryWithBasicOptions =
        message.includes('Self-contradictory configuration') ||
        message.includes('systemAudio') ||
        message.includes('windowAudio');

      if (!shouldRetryWithBasicOptions) {
        throw error;
      }

      console.warn('[ScreenRecorder] Retrying screen capture with basic options:', error);
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });
    }

    let micStream: MediaStream | null = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // Keep the mic fallback as raw as possible so it can still pick up
          // meeting sound from speakers when the browser cannot expose
          // system/window audio to getDisplayMedia.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 2,
        },
      });
    } catch (error) {
      console.warn('[ScreenRecorder] Microphone capture unavailable:', error);
    }

    const videoTrack = displayStream.getVideoTracks()[0];
    if (!videoTrack) {
      displayStream.getTracks().forEach((track) => track.stop());
      micStream?.getTracks().forEach((track) => track.stop());
      throw new Error('No video track available from screen capture');
    }

    const displayAudioTracks = displayStream.getAudioTracks();
    const micAudioTracks = micStream?.getAudioTracks() || [];
    let audioContext: AudioContext | null = null;
    let mixedAudioTrack: MediaStreamTrack | null = null;

    if (displayAudioTracks.length > 0 || micAudioTracks.length > 0) {
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
        micGain.gain.value = 1;
        micAudioSource.connect(micGain);
        micGain.connect(destination);
      }

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      mixedAudioTrack = destination.stream.getAudioTracks()[0] || null;
    }

    const recordingTracks = [videoTrack];
    if (mixedAudioTrack) {
      recordingTracks.push(mixedAudioTrack);
    }

    return {
      displayStream,
      micStream,
      audioContext,
      recordingStream: new MediaStream(recordingTracks),
      hasDisplayAudio: displayAudioTracks.length > 0,
      hasMicAudio: micAudioTracks.length > 0,
    };
  }, []);

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

  const startRecording = useCallback(async () => {
    if (!isScreenCaptureSupported()) {
      toast.error('Screen recording is not supported in this browser.');
      return;
    }
    if (isFirefox()) {
      toast('Firefox may not capture audio. Use Chrome or Edge for best results.', { icon: '⚠️', duration: 5000 });
    }

    try {
      const {
        displayStream,
        micStream,
        audioContext,
        recordingStream,
        hasDisplayAudio,
        hasMicAudio,
      } = await buildRecordingStream();
      displayStreamRef.current = displayStream;
      micStreamRef.current = micStream;
      audioContextRef.current = audioContext;
      recordingStreamRef.current = recordingStream;

      if (!hasDisplayAudio) {
        stopActiveStreams();
        setState('error');
        setErrorMsg(
          hasMicAudio
            ? 'Shared screen audio was not detected. To record meeting audio, start again and choose a browser tab or entire screen with audio enabled. Window-only sharing for the Zoom desktop app usually records silent video.'
            : 'No audio source was captured. Start again and choose a browser tab or entire screen with audio enabled.'
        );
        toast.error('Shared audio was not detected. Please restart and share with audio enabled.');
        return;
      }

      // Pick best supported mime
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';

      const recorder = new MediaRecorder(recordingStream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        blobRef.current = blob;
        setBlobSize(blob.size);
        stopActiveStreams();
        handleUpload(blob);
      };

      // Auto-stop when user stops sharing
      displayStream.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      });

      recorder.start(1000); // collect data every second
      setState('recording');
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
      toast.success('Recording started!');
    } catch (err) {
      if ((err as DOMException).name === 'NotAllowedError') {
        toast.error('Screen sharing was cancelled.');
      } else {
        toast.error('Failed to start recording.');
        console.error('[ScreenRecorder]', err);
        stopActiveStreams();
      }
    }
  }, [buildRecordingStream, handleUpload, stopActiveStreams]);

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

  return (
    <>
      {/* Floating badge while recording */}
      {state === 'recording' && <RecordingBadge elapsed={formatTime(elapsed)} />}

      <div style={s.overlay} onClick={state === 'recording' ? undefined : onClose}>
        <div style={s.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={s.header}>
            <div>
              <h2 style={s.title}>Screen Recording</h2>
              <p style={s.subtitle}>Record your session screen</p>
            </div>
            {state !== 'recording' && state !== 'uploading' && onClose && (
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
              </div>
            )}

            {/* RECORDING */}
            {state === 'recording' && (
              <div style={s.center}>
                <div style={{ fontSize: 36, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#0f172a', letterSpacing: '0.05em' }}>
                  {formatTime(elapsed)}
                </div>
                <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, margin: 0 }}>
                  Recording in progress... Your screen is being captured.
                </p>
                <button
                  onClick={stopRecording}
                  style={{ ...s.btnPrimary, background: '#ef4444', boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}
                >
                  <Square size={16} fill="#fff" />
                  Stop &amp; Save
                </button>
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
          {state !== 'success' && (
            <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
              <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, margin: 0, textAlign: 'center' }}>
                🎬 You can record any window or the full screen. If you need meeting audio, turn audio on in the share dialog.
              </p>
            </div>
          )}
        </div>

        <style>{`
          @keyframes sr-fadein {
            from { opacity: 0; transform: scale(0.96) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
}
