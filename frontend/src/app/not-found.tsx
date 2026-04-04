import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <h2 className="text-6xl font-bold mb-4">404</h2>
      <p className="text-xl mb-8">Page Not Found</p>
      <div className="flex gap-4">
        <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Go Home
        </Link>
        <Link href="/login" className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">
          Login Sign In
        </Link>
      </div>
    </div>
  );
}
