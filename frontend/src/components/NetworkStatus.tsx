'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCcw } from 'lucide-react';

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-sm px-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-4 rounded-full">
            <WifiOff className="w-12 h-12 text-red-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Internet Connection</h2>
        <p className="text-gray-600 mb-8">
          It looks like you've lost your network connection. Please check your Wi-Fi or mobile data and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCcw className="w-5 h-5" />
          Try to Reconnect
        </button>
      </div>
    </div>
  );
}
