'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function ClearSessionPage() {
  const clerk = useClerk();
  const [status, setStatus] = useState('Clearing stuck Clerk sessions...');

  useEffect(() => {
    const nuke = async () => {
      try {
        // Step 1: Try Clerk's official signOut (clears server-side session + cookies)
        if (clerk?.signOut) {
          try {
            await clerk.signOut();
          } catch {
            // may fail if not signed in, that's fine
          }
        }

        // Step 2: Destroy the Clerk client entirely (removes __clerk_db_jwt cookie)
        if (clerk?.client?.destroy) {
          try {
            await clerk.client.destroy();
          } catch {
            // ignore
          }
        }

        // Step 3: Clear all local storage
        try { localStorage.clear(); } catch {}
        try { sessionStorage.clear(); } catch {}

        // Step 4: Clear all cookies on localhost
        document.cookie.split(';').forEach((c) => {
          const name = c.split('=')[0].trim();
          if (name) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`;
          }
        });

        setStatus('✅ Sessions cleared! Redirecting to a fresh signup...');

        // Hard redirect (not Next.js router) to avoid any cached state
        setTimeout(() => {
          window.location.replace('/signup');
        }, 1500);
      } catch (err) {
        console.error('Clear failed:', err);
        // Nuclear fallback: redirect to Clerk's signout then back
        setStatus('Trying alternate cleanup...');
        setTimeout(() => {
          window.location.replace('/signup');
        }, 1000);
      }
    };

    // Wait for Clerk to fully initialize before destroying
    const timer = setTimeout(nuke, 2000);
    return () => clearTimeout(timer);
  }, [clerk]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 mx-auto animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-lg font-semibold text-slate-700">{status}</p>
        <p className="mt-2 text-sm text-slate-500">Destroying stuck Clerk sign-up session</p>
      </div>
    </div>
  );
}
