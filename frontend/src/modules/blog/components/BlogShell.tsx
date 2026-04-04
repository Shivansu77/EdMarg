import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BlogShellProps {
  children: React.ReactNode;
}

export function BlogShell({ children }: BlogShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_20%_-5%,#dbe7ff_0%,transparent_60%),radial-gradient(900px_450px_at_100%_0%,#f8e7ff_0%,transparent_55%),#f8fbff] text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">{children}</main>
      <Footer />
    </div>
  );
}
