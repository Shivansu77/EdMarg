'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import SessionRecordingPlayer from '@/components/SessionRecordingPlayer';
import { getImageUrl } from '@/utils/imageUrl';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User as UserIcon,
  AlertCircle,
  Mail,
  Video,
} from 'lucide-react';
import Image from 'next/image';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Mentor {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

interface BookingDetails {
  _id: string;
  mentor: Mentor;
  date: string;
  startTime: string;
  endTime: string;
  sessionDuration: number;
  sessionType: string;
  status: string;
}

// ─── Content Component ─────────────────────────────────────────────────────
function RecordingPageContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        await apiClient.get('/api/v1/zoom/process-pending?limit=1');

        // Fetch broader history to include sessions that may still be
        // in-progress but already expose a recording URL.
        const response = await apiClient.get<{ bookings: BookingDetails[] }>(
          '/api/v1/bookings/my-bookings?limit=100'
        );
        if (response.success && response.data?.bookings) {
          const found = response.data.bookings.find((b) => b._id === sessionId);
          if (found) {
            setBooking(found);
          } else {
            setError('Session not found');
          }
        } else {
          setError('Failed to load session details');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) fetchBooking();
  }, [sessionId]);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  return (
    <DashboardLayout userName={user?.name || 'Recording'}>
      <style>{pageStyles}</style>
      <div className="rec-page-container">
        {/* Back Navigation */}
        <button
          onClick={() => router.push('/student/history')}
          className="rec-back-btn"
        >
          <ArrowLeft className="rec-back-icon" />
          <span>Back to Session History</span>
        </button>

        {/* Page Header */}
        <div className="rec-header">
          <div className="rec-header-icon">
            <Video style={{ width: 22, height: 22, color: 'white' }} />
          </div>
          <div>
            <h1 className="rec-title">Session Recording</h1>
            <p className="rec-subtitle">
              Watch your mentorship session recording securely.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rec-error-banner">
            <AlertCircle className="rec-error-icon" />
            <p className="rec-error-text">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rec-loading">
            <div className="rec-spinner" />
            <p className="rec-loading-text">Loading session details...</p>
          </div>
        ) : (
          <>
            {/* Video Player — Full Width Cinema Mode */}
            {sessionId && (
              <div className="rec-player-section">
                <SessionRecordingPlayer sessionId={sessionId} inline />
              </div>
            )}

            {/* Session Details Card */}
            {booking && (
              <div className="rec-details-card">
                <h2 className="rec-details-title">Session Details</h2>

                <div className="rec-mentor-row">
                  <div className="rec-mentor-avatar">
                    {booking.mentor.profileImage ? (
                      <Image
                        src={getImageUrl(
                          booking.mentor.profileImage,
                          booking.mentor.name
                        )}
                        alt={booking.mentor.name}
                        width={52}
                        height={52}
                        className="rec-mentor-img"
                      />
                    ) : (
                      <UserIcon style={{ width: 24, height: 24, color: '#10b981' }} />
                    )}
                  </div>
                  <div className="rec-mentor-info">
                    <h3 className="rec-mentor-name">{booking.mentor.name}</h3>
                    <p className="rec-mentor-email">
                      <Mail style={{ width: 13, height: 13, opacity: 0.5 }} />
                      {booking.mentor.email}
                    </p>
                  </div>
                  <span className="rec-session-badge">
                    <span className="rec-badge-dot" />
                    Completed
                  </span>
                </div>

                <div className="rec-details-grid">
                  <div className="rec-detail-item">
                    <div className="rec-detail-icon-wrap">
                      <Calendar style={{ width: 16, height: 16, color: '#10b981' }} />
                    </div>
                    <div>
                      <span className="rec-detail-label">Date</span>
                      <span className="rec-detail-value">{formatDate(booking.date)}</span>
                    </div>
                  </div>
                  <div className="rec-detail-item">
                    <div className="rec-detail-icon-wrap">
                      <Clock style={{ width: 16, height: 16, color: '#10b981' }} />
                    </div>
                    <div>
                      <span className="rec-detail-label">Time</span>
                      <span className="rec-detail-value">
                        {booking.startTime} – {booking.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="rec-detail-item">
                    <div className="rec-detail-icon-wrap">
                      <Video style={{ width: 16, height: 16, color: '#10b981' }} />
                    </div>
                    <div>
                      <span className="rec-detail-label">Duration</span>
                      <span className="rec-detail-value">{booking.sessionDuration} minutes</span>
                    </div>
                  </div>
                </div>

                {/* Keyboard Shortcuts Hint */}
                <div className="rec-shortcuts-hint">
                  <span className="rec-shortcuts-title">Keyboard Shortcuts</span>
                  <div className="rec-shortcuts-list">
                    <span><kbd>Space</kbd> Play/Pause</span>
                    <span><kbd>←</kbd><kbd>→</kbd> Skip 10s</span>
                    <span><kbd>↑</kbd><kbd>↓</kbd> Volume</span>
                    <span><kbd>F</kbd> Fullscreen</span>
                    <span><kbd>M</kbd> Mute</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Page Export (Protected Route) ──────────────────────────────────────────
export default function RecordingPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <RecordingPageContent />
    </ProtectedRoute>
  );
}

// ─── Scoped Page Styles ─────────────────────────────────────────────────────
const pageStyles = `
.rec-page-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

@media (min-width: 640px) {
  .rec-page-container {
    padding: 32px 24px 64px;
  }
}

/* ─── Back Button ────────────────────────────────────────── */
.rec-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 0;
  margin-bottom: 24px;
  transition: color 0.2s ease;
}
.rec-back-btn:hover {
  color: #10b981;
}
.rec-back-btn:hover .rec-back-icon {
  transform: translateX(-3px);
}
.rec-back-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

/* ─── Header ─────────────────────────────────────────────── */
.rec-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.rec-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 4px 16px rgba(16,185,129,0.25);
  flex-shrink: 0;
}
.rec-title {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.rec-subtitle {
  margin-top: 4px;
  font-size: 14px;
  color: #9ca3af;
}

/* ─── Error ──────────────────────────────────────────────── */
.rec-error-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  margin-bottom: 24px;
  border-radius: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
}
.rec-error-icon {
  width: 20px;
  height: 20px;
  color: #ef4444;
  flex-shrink: 0;
  margin-top: 1px;
}
.rec-error-text {
  font-size: 14px;
  color: #991b1b;
}

/* ─── Loading ────────────────────────────────────────────── */
.rec-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}
.rec-spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2.5px solid #d1fae5;
  border-top-color: #10b981;
  animation: recSpin 0.7s linear infinite;
}
.rec-loading-text {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
}
@keyframes recSpin {
  to { transform: rotate(360deg); }
}

/* ─── Player Section ─────────────────────────────────────── */
.rec-player-section {
  margin-bottom: 28px;
  border-radius: 20px;
  overflow: hidden;
  background: #000;
  box-shadow:
    0 8px 40px rgba(0,0,0,0.12),
    0 2px 8px rgba(0,0,0,0.06);
}

/* ─── Details Card ───────────────────────────────────────── */
.rec-details-card {
  border-radius: 20px;
  border: 1px solid #f3f4f6;
  background: white;
  padding: 28px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.rec-details-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 20px;
}

/* ─── Mentor Row ─────────────────────────────────────────── */
.rec-mentor-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}
.rec-mentor-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 2px solid #a7f3d0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.rec-mentor-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}
.rec-mentor-info {
  flex: 1;
  min-width: 0;
}
.rec-mentor-name {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.rec-mentor-email {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #9ca3af;
  margin-top: 2px;
}
.rec-session-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 20px;
  flex-shrink: 0;
}
.rec-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

/* ─── Details Grid ───────────────────────────────────────── */
.rec-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.rec-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
}
.rec-detail-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #ecfdf5;
  flex-shrink: 0;
}
.rec-detail-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
}
.rec-detail-value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-top: 2px;
}

/* ─── Keyboard Shortcuts Hint ────────────────────────────── */
.rec-shortcuts-hint {
  padding: 14px 18px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
}
.rec-shortcuts-title {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  margin-bottom: 10px;
}
.rec-shortcuts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}
.rec-shortcuts-list kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  color: #374151;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  margin-right: 3px;
}
`;
