import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center relative overflow-hidden py-20">
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto flex flex-col items-center">
          
          <div className="relative w-full max-w-[400px] aspect-square mb-8">
            <Image 
              src="/404-illustration.jpg" 
              alt="Page not found illustration" 
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <h1 className="text-[32px] sm:text-[36px] font-bold text-[#1e1b4b] mb-4 tracking-tight leading-tight">
            We can&apos;t find the page you&apos;re<br className="hidden sm:block" /> looking for
          </h1>
          
          <p className="text-[17px] text-gray-600">
            Visit our <Link href="/contact" className="text-[#8b5cf6] hover:underline decoration-1 underline-offset-4">support page</Link> for further assistance.
          </p>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
