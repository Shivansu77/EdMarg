'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, MapPin, Clock, MessageCircle, Share2, Heart, ChevronLeft, Award, Briefcase, CheckCircle2, User } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';

type Mentor = {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  mentorProfile?: {
    expertise?: string[];
    bio?: string;
    experienceYears?: number;
    pricePerSession?: number;
    rating?: number;
    totalSessions?: number;
  };
};

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

function StudentMentorProfileContent() {
  const params = useParams();
  const mentorId = params.id as string;

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'expertise' | 'reviews'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  const mockReviews: Review[] = [
    {
      id: '1',
      author: 'Sarah Johnson',
      rating: 5,
      text: 'The sessions were incredibly structured. Got actionable feedback that immediately improved my interview hit rate.',
      date: '2 weeks ago',
      avatar: 'https://ui-avatars.com/api/?background=f3f4f6&color=111827&name=SJ&size=40',
    },
    {
      id: '2',
      author: 'Mike Chen',
      rating: 5,
      text: 'Very precise insights on product management. Thorough portfolio reviews.',
      date: '1 month ago',
      avatar: 'https://ui-avatars.com/api/?background=f3f4f6&color=111827&name=MC&size=40',
    },
  ];

  useEffect(() => {
    if (!mentorId) return;

    const fetchMentor = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/v1/users/browsementor`,
          createAuthenticatedRequestInit({ method: 'GET' })
        );

        if (!response.ok) throw new Error('Failed to fetch mentors');

        const result = await response.json();
        const mentorData = result.data?.find((m: Mentor) => m._id === mentorId);

        if (!mentorData) {
          setError('Profile not found.');
        } else {
          setMentor(mentorData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [mentorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-8 h-8 border-[3px] border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-white p-12 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Unavailable</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">{error || "This mentor is no longer listed in the directory."}</p>
          <Link href="/student/mentors" className="inline-block bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition-all shadow-md active:scale-95">
            Return to Search
          </Link>
        </div>
      </div>
    );
  }

  const rating = mentor.mentorProfile?.rating ?? 4.9;
  const sessions = mentor.mentorProfile?.totalSessions ?? 24;
  const expertise = mentor.mentorProfile?.expertise ?? [];
  const bio = mentor.mentorProfile?.bio || 'Experienced professional ready to help you grow. I specialize in accelerating career growth and providing highly actionable portfolio and interview feedback tailored to modern industry standards.';
  const experience = mentor.mentorProfile?.experienceYears ?? 0;
  const price = mentor.mentorProfile?.pricePerSession ?? null;

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-gray-900 selection:text-white pb-24 font-sans text-gray-900">
      
      {/* Immersive Blur Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/student/mentors" className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm hover:shadow">
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Directory
          </Link>
          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2.5 rounded-full border transition-all active:scale-95 shadow-sm ${
                isFavorite 
                ? 'bg-red-50 border-red-100 text-red-500' 
                : 'bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-200'
              }`}
            >
              <Heart size={18} className={isFavorite ? 'fill-current' : ''} strokeWidth={2.5} />
            </button>
            <button className="p-2.5 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-gray-900 transition-all shadow-sm active:scale-95" aria-label="Share">
              <Share2 size={18} strokeWidth={2.5}/>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-12 lg:mt-16">
        
        {/* Soft Modern Header Layout */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 lg:gap-16 pb-12">
            
            <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
               {/* Clean Avatar */}
               <div className="relative flex-shrink-0 group">
                 <div className="absolute inset-0 bg-gray-200 rounded-[2.5rem] rotate-3 transition-transform group-hover:rotate-6 opacity-30"></div>
                 <img
                    src={mentor.profileImage || `https://ui-avatars.com/api/?background=ffffff&color=111827&name=${encodeURIComponent(mentor.name)}&size=300`}
                    alt={mentor.name}
                    className="relative w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] object-cover bg-white shadow-xl shadow-gray-200/50 border-4 border-white"
                  />
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
               </div>
              
              <div className="flex-1 md:pt-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">{mentor.name}</h1>
                <p className="text-xl text-gray-500 font-medium mb-6 tracking-tight">{expertise[0] || 'Strategic Career Guide'}</p>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-gray-200 shadow-sm">
                     <Briefcase size={16} className="text-gray-400" />
                     <span className="font-bold">{experience > 0 ? `${experience} Yrs Exp` : 'Industry Expert'}</span>
                  </div>
                  {rating > 0 && (
                    <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-gray-200 shadow-sm">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      <span><span className="font-bold text-gray-900">{rating.toFixed(1)}</span> · <span className="text-gray-500 font-medium">{sessions} Sessions</span></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-full border border-gray-200 shadow-sm">
                     <MapPin size={16} className="text-gray-400" />
                     <span className="font-bold">Virtual</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Action Card Overlay */}
            <div className="hidden lg:flex flex-col w-[320px] flex-shrink-0 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Session Rate</p>
                <div className="flex items-baseline gap-1.5 mb-8">
                   <span className="text-5xl font-black tracking-tighter text-gray-900">{price !== null && price > 0 ? `₹${price}` : 'Free'}</span>
                </div>
                
                <Link
                  href={`/student/booking?id=${mentor._id}`}
                  className="flex items-center justify-center w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                >
                  Book 45 Min Session
                </Link>
                <button className="flex items-center justify-center gap-2 w-full bg-transparent border border-gray-200 text-gray-700 font-bold py-4 mt-3 hover:bg-gray-50 transition-all rounded-2xl active:scale-95">
                  <MessageCircle size={18} className="text-gray-400" />
                  Message
                </button>
            </div>
        </header>

        {/* Floating Modern Tabs */}
        <div className="mb-12">
          <div className="inline-flex gap-2 p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200/50">
             {[
               { id: 'overview', label: 'Overview' },
               { id: 'expertise', label: 'Expertise' },
               { id: 'reviews', label: 'Reviews' }
             ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
             ))}
          </div>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 relative">
           
           {/* Left Content Area */}
           <div className="lg:col-span-8 min-h-[400px]">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-12 animate-in fade-in duration-500">
                  <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">About</h2>
                    <p className="text-gray-600 leading-relaxed text-[17px] font-medium whitespace-pre-line">
                      {bio}
                    </p>
                  </section>

                  <section className="bg-gray-900 rounded-[2rem] p-8 md:p-10 shadow-lg text-white">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">What You Will Accomplish</h2>
                    <ul className="grid sm:grid-cols-2 gap-y-8 gap-x-10">
                      {[
                        '1-on-1 personalized strategic mentoring based on your timeline.',
                        'Direct career progression guidance mapped from successful peers.',
                        'Deep-dive portfolio tear-downs optimizing for top 1% conversions.',
                        'Rigorous mock interviews and immediate behavioral feedback loops.'
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4">
                          <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          <span className="text-gray-300 text-[15px] font-medium leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}

              {/* Expertise Tab */}
              {activeTab === 'expertise' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                   <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm">
                     <h2 className="text-xl font-black text-gray-900 mb-6">Mastery Domains</h2>
                     <div className="flex flex-wrap gap-2.5">
                       {expertise.length > 0 ? (
                         expertise.map((skill) => (
                           <span key={skill} className="px-5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700 hover:border-gray-300 transition-colors cursor-default">
                             {skill}
                           </span>
                         ))
                       ) : (
                         <span className="text-gray-400 italic font-medium">No strict specific domains currently listed.</span>
                       )}
                     </div>
                   </section>

                   <section className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm">
                     <h2 className="text-xl font-black text-gray-900 mb-8">Career Authority</h2>
                     <div className="space-y-4">
                        <div className="flex gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className="w-1.5 min-h-full rounded-full bg-gray-300"></div>
                           <div>
                             <h3 className="font-extrabold text-gray-900 text-lg">{experience}+ Years Active Industry Experience</h3>
                             <p className="text-gray-500 font-medium mt-1">Consistent track record of delivering high quality architecture and team leadership at scale.</p>
                           </div>
                        </div>
                        <div className="flex gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                           <div className="w-1.5 min-h-full rounded-full bg-gray-300"></div>
                           <div>
                             <h3 className="font-extrabold text-gray-900 text-lg">{sessions} Verified Mentorship Sessions</h3>
                             <p className="text-gray-500 font-medium mt-1">Proven, documented ability to elevate mentees into higher percentile performance tiers and secure outcomes.</p>
                           </div>
                        </div>
                     </div>
                   </section>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-8 animate-in fade-in duration-500 bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 py-4">
                    <div className="text-7xl font-black tracking-tighter text-gray-900">{rating.toFixed(1)}</div>
                    <div className="pt-2 text-center sm:text-left">
                      <div className="flex gap-1 mb-2">
                         {[...Array(5)].map((_, i) => (
                            <Star key={i} size={24} className={i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-100'} />
                         ))}
                      </div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Aggregated Metric<br/>Based on {sessions} completed sessions</p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div className="space-y-6 pt-4">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex gap-1 mb-4">
                           {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
                           ))}
                        </div>
                        <p className="text-gray-800 text-[16px] font-medium leading-relaxed mb-6">&quot;{review.text}&quot;</p>
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden shadow-sm">
                             <img src={review.avatar} alt={review.author} className="w-full h-full" />
                           </div>
                           <div>
                             <span className="font-extrabold text-gray-900 block">{review.author}</span>
                             <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{review.date}</span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

           </div>

           {/* Right Column (Sidebar details / Mobile Action Block) */}
           <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Mobile Booking Action */}
              <div className="lg:hidden w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Session Rate</p>
                  <p className="text-4xl font-black tracking-tighter text-gray-900 mb-6">{price !== null && price > 0 ? `₹${price}` : 'Free'}</p>
                  
                  <Link
                    href={`/student/booking?id=${mentor._id}`}
                    className="flex items-center justify-center w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors active:scale-95"
                  >
                    Book Session
                  </Link>
                  <button className="flex items-center justify-center w-full bg-transparent border border-gray-200 text-gray-700 font-bold py-4 mt-3 hover:bg-gray-50 transition-colors rounded-xl active:scale-95">
                    Send Message
                  </button>
              </div>

              {/* Logistics Block */}
              <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm space-y-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4">Logistics</h3>
                 
                 <div className="flex items-center gap-4 text-gray-800">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                       <Clock size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[15px]">45 Min Duration</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 text-gray-800">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                       <MapPin size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[15px]">100% Virtual</p>
                    </div>
                 </div>
              </div>

              {/* Contact Block */}
              <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4 mb-5">Contact Details</h3>
                 <a href={`mailto:${mentor.email}`} className="text-[15px] font-bold text-gray-900 hover:text-gray-500 transition-colors break-all">
                    {mentor.email}
                 </a>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

export default function StudentMentorProfilePage() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentMentorProfileContent />
    </ProtectedRoute>
  );
}
