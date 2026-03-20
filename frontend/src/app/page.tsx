import Link from 'next/link';
import TransformSection from '@/components/TransformSection';
import TopMentorsSection from '@/components/TopMentorsSection';
import JoinSection from '@/components/JoinSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans selection:bg-purple-200">
      {/* Navbar segment */}
      <header className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full border-b border-transparent">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            EDMARG
            <span className="text-purple-600">.</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <Link href="/mentors" className="hover:text-purple-600 transition-colors">Mentors</Link>
            <Link href="/assessment" className="hover:text-purple-600 transition-colors">Assessment</Link>
          </nav>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-semibold border-2 border-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left column - Abstract Illustration Placeholder */}
        <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center">
          {/* Illustration mockup mimicking the hand and pill shapes */}
          <div className="relative w-full h-full max-w-[400px] max-h-[400px]">
            {/* Outline shapes & sparks */}
            <svg className="absolute inset-0 w-full h-full text-gray-900" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M50 150 C 40 100, 100 80, 120 120" strokeLinecap="round" />
              <path d="M300 100 C 350 90, 360 140, 320 160" strokeLinecap="round" />
              {/* Sparkles */}
              <path d="M 80 80 L 90 90 M 90 80 L 80 90" strokeLinecap="round" />
              <path d="M 330 250 L 340 260 M 340 250 L 330 260" strokeLinecap="round" />
            </svg>

            {/* Pill 1 */}
            <div className="absolute top-[25%] left-[10%] bg-[#FFD147] border-2 border-gray-900 rounded-full px-8 py-4 transform -rotate-12 shadow-[4px_4px_0px_rgba(17,24,39,1)] z-10 transition-transform hover:-translate-y-1 hover:scale-105">
              <span className="text-xl font-bold tracking-wide">Students</span>
            </div>

            {/* Pill 2 */}
            <div className="absolute top-[45%] left-[20%] bg-[#6B46FF] text-white border-2 border-gray-900 rounded-full px-10 py-5 transform rotate-3 shadow-[4px_4px_0px_rgba(17,24,39,1)] z-20 transition-transform hover:-translate-y-1 hover:scale-105">
              <span className="text-2xl font-bold tracking-wide">Studying</span>
            </div>

            {/* Pill 3 */}
            <div className="absolute top-[65%] left-[15%] bg-[#4ADE80] border-2 border-gray-900 rounded-full px-12 py-5 transform -rotate-6 shadow-[4px_4px_0px_rgba(17,24,39,1)] z-30 transition-transform hover:-translate-y-1 hover:scale-105">
              <span className="text-2xl font-bold tracking-wide">Together</span>
            </div>

            {/* Bottom hand shape outline */}
            <svg className="absolute bottom-0 right-[10%] w-32 h-32 text-gray-900 transform translate-y-1/2" viewBox="0 0 100 100" fill="#FFC0CB" stroke="currentColor" strokeWidth="2">
              <path d="M 30 80 C 10 70, 0 50, 10 30 C 20 10, 50 10, 60 30 C 70 50, 90 60, 80 80 C 70 100, 40 100, 30 80 Z" />
              <path d="M 60 30 C 70 20, 80 30, 75 45" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Right column - Content & Form */}
        <div className="flex flex-col items-start max-w-lg">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Your Path to the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              Right Career
            </span>
          </h1>

          <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10">
            Connect with expert mentors and discover your perfect career through personalized guidance.
          </p>

          {/* Email Signup Form */}
          <form className="relative w-full max-w-md flex items-center mb-12 shadow-[0px_8px_24px_rgba(0,0,0,0.06)] rounded-full border-2 border-gray-200 focus-within:border-purple-600 transition-colors">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent border-none outline-none py-4 px-6 text-gray-800 placeholder-gray-400 rounded-l-full"
              required
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 bg-[#6B46FF] hover:bg-[#5835ea] text-white px-6 font-semibold rounded-full transition-colors whitespace-nowrap"
            >
              Take Career Assessment
            </button>
          </form>

          {/* Trusted Companies */}
          <div>
            <p className="text-sm text-gray-500 mb-4 font-medium">Largest companies find talent here.</p>
            <div className="flex items-center gap-6 opacity-60 grayscale">
              {/* Fake Logos using Text */}
              <span className="text-xl font-bold font-serif tracking-tighter">Google</span>
              <span className="text-xl font-bold tracking-tighter text-green-600">hulu</span>
              <span className="text-xl font-semibold tracking-wide uppercase">Uber</span>
              <span className="text-xl font-bold tracking-tight text-indigo-600">stripe</span>
            </div>
          </div>

        </div>

      </main>

      <TransformSection />
      <JoinSection />
      <TopMentorsSection />
    </div>
  );
}
