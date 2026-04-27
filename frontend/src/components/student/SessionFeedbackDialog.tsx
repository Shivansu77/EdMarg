'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, MessageSquareText, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/utils/api-client';

interface ExistingReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

interface SessionFeedbackDialogProps {
  bookingId: string;
  mentorName: string;
  isOpen: boolean;
  existingReview?: ExistingReview | null;
  onClose: () => void;
  onSubmitted: (review: ExistingReview) => void;
}

const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function SessionFeedbackDialog({
  bookingId,
  mentorName,
  isOpen,
  existingReview,
  onClose,
  onSubmitted,
}: SessionFeedbackDialogProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || '');
    setHoveredStar(0);
    setSubmitting(false);
  }, [existingReview, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, submitting]);

  if (!isOpen) {
    return null;
  }

  const effectiveRating = hoveredStar || rating;
  const commentLength = comment.trim().length;
  const isReadOnly = Boolean(existingReview);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Please choose a star rating.');
      return;
    }

    if (commentLength < 10) {
      toast.error('Please add a little more feedback so mentors can learn from it.');
      return;
    }

    setSubmitting(true);

    const response = await apiClient.post<ExistingReview>('/api/v1/reviews', {
      bookingId,
      rating,
      comment: comment.trim(),
    });

    setSubmitting(false);

    if (!response.success || !response.data) {
      toast.error(response.error || response.message || 'Unable to submit feedback');
      return;
    }

    toast.success('Thanks for sharing your feedback.');
    onSubmitted(response.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">
              Meeting Feedback
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              {isReadOnly ? 'Your submitted review' : `How was your session with ${mentorName}?`}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isReadOnly
                ? 'You have already rated this session.'
                : 'Share a star rating and a few words about the meeting.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed"
            aria-label="Close feedback dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5">
            <div className="flex flex-wrap items-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= effectiveRating;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      if (!isReadOnly) {
                        setRating(star);
                      }
                    }}
                    onMouseEnter={() => !isReadOnly && setHoveredStar(star)}
                    onMouseLeave={() => !isReadOnly && setHoveredStar(0)}
                    disabled={isReadOnly}
                    className={`rounded-2xl border px-3 py-3 transition ${
                      isActive
                        ? 'border-amber-300 bg-white shadow-sm'
                        : 'border-transparent bg-white/70'
                    } ${isReadOnly ? 'cursor-default' : 'hover:-translate-y-0.5 hover:border-amber-200'}`}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        isActive ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-lg font-black text-slate-900">
                {rating > 0 ? `${rating}.0` : '--'}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                {effectiveRating > 0 ? STAR_LABELS[effectiveRating - 1] : 'Pick a rating'}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
              <MessageSquareText className="h-4 w-4 text-emerald-600" />
              What feedback would you like to share?
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="The mentor explained things clearly, gave actionable advice, and helped me leave with next steps..."
              disabled={isReadOnly || submitting}
              rows={6}
              maxLength={1000}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:cursor-default disabled:bg-slate-50"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{isReadOnly ? 'Feedback saved for this session.' : 'Minimum 10 characters'}</span>
              <span>{commentLength}/1000</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed"
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>

          {!isReadOnly && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit feedback'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
