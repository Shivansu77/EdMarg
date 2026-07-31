'use client';

interface AuthRecoveryProps {
  message?: string | null;
  onRetry: () => void;
}

/** A stable recovery screen for an authenticated Clerk session whose profile API is unavailable. */
export default function AuthRecovery({ message, onRetry }: AuthRecoveryProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">We could not finish loading your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          {message || 'Please retry in a moment.'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
