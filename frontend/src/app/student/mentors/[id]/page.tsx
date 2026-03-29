'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Star,
  ChevronLeft,
  MessageCircle,
  Heart,
  Share2,
  Briefcase,
  Clock,
  User,
  CheckCircle2,
  Video,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { createAuthenticatedRequestInit } from '@/utils/auth-fetch';

type Mentor = {
  _id: string;
  name: string;
  email: string;
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function StudentMentorProfile() {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <DashboardLayout userName={user?.name || "Mentor Profile"}>
        <StudentMentorProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

/* ========================================================= */

function StudentMentorProfileContent() {
  const { user } = useAuth();
  const params = useParams();
  const mentorId = params.id as string;

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'expertise' | 'reviews'
  >('overview');
  const [favorite, setFavorite] = useState(false);

  const mockReviews: Review[] = [
    {
      id: '1',
      author: 'Sarah Johnson',
      rating: 5,
      text: 'The sessions were incredibly structured. Got actionable feedback that immediately improved my interview hit rate.',
      date: '2 weeks ago',
      avatar: 'https://ui-avatars.com/api/?background=f3f4f6&color=4f46e5&name=SJ&size=40',
    },
    {
      id: '2',
      author: 'Mike Chen',
      rating: 5,
      text: 'Very precise insights on product management. Thorough portfolio reviews.',
      date: '1 month ago',
      avatar: 'https://ui-avatars.com/api/?background=f3f4f6&color=4f46e5&name=MC&size=40',
    },
  ];

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!mentorId) return;

    const fetchMentor = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/api/v1/users/browsementor`,
          createAuthenticatedRequestInit({ method: 'GET' })
        );

        if (!res.ok) throw new Error('Failed loading mentor');

        const result = await res.json();
        const mentorData = (result.data as Mentor[])?.find(
          (m) => m._id === mentorId
        );

        if (!mentorData) setError('Mentor not found');
        else setMentor(mentorData);
      } catch (err) {
        setError('Unable to load mentor');
      } finally {
        setLoading(false);
      }
    };

    fetchMentor();
  }, [mentorId]);

  /* ================= STATES ================= */

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );

  if (error || !mentor)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {error}
      </div>
    );

  const profile = mentor.mentorProfile;

  const rating = profile?.rating ?? 4.9;
  const sessions = profile?.totalSessions ?? 0;
  const price = profile?.pricePerSession ?? 0;
  const expertise = profile?.expertise ?? [];
  const bio =
    profile?.bio ??
    'Experienced mentor helping students accelerate their careers with practical industry guidance.';
  const experience = profile?.experienceYears ?? 0;

  /* ========================================================= */

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ================= HEADER SECTION ================= */}
      <section className="grid lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT: Identity & Stats */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Breadcrumb Back */}
           <Link
             href="/student/mentors"
             className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-all group"
           >
             <ChevronLeft size={14} className="group-hover:-translate-x-0.5" />
             Back to Directory
           </Link>

           <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
              {/* Profile Image with squircle border */}
              <div className="relative group flex-shrink-0">
                 <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                 <div className="relative w-44 h-44 rounded-3xl overflow-hidden bg-white shadow-2xl p-1 border border-white">
                    <div className="w-full h-full rounded-2xl overflow-hidden">
                       <Image
                         src={mentor.profileImage || `https://ui-avatars.com/api/?background=f8fafc&color=4f46e5&name=${encodeURIComponent(mentor.name)}&size=300`}
                         alt={mentor.name}
                         fill
                         className="object-cover transition-transform group-hover:scale-105 duration-700"
                       />
                    </div>
                 </div>
              </div>

              <div className="flex-1 space-y-4 pt-2">
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
                   {mentor.name}
                 </h1>
                 <p className="text-xl font-semibold text-gray-500 max-w-xl">
                   {expertise[0] || 'Professional Industry Mentor'}
                 </p>

                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                   <Stat icon={<Briefcase size={18} className="text-indigo-500" />} label={`${experience}+ yrs Exp`} />
                   <Stat
                     icon={<Star size={18} className="fill-amber-400 text-amber-500" />}
                     label={`${rating.toFixed(1)} (${sessions} Sessions)`}
                   />
                   <div className="flex gap-2 ml-auto md:ml-0">
                      <button
                        onClick={() => setFavorite(!favorite)}
                        className={`p-2.5 rounded-xl border transition-all active:scale-95 shadow-sm ${
                           favorite 
                           ? 'bg-red-50 border-red-100 text-red-500' 
                           : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100'
                        }`}
                      >
                        <Heart size={20} className={favorite ? 'fill-current' : ''} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
                        <Share2 size={20} />
                      </button>
                   </div>
                 </div>
              </div>
           </div>

           {/* ================= TABS & CONTENT ================= */}
           <div className="space-y-8">
              <div className="flex gap-2 p-1 bg-gray-100/50 rounded-2xl border border-gray-200 w-fit">
                {['overview', 'expertise', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${
                      activeTab === tab
                        ? 'bg-white text-indigo-600 shadow-sm border border-gray-200'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 md:p-12 min-h-[350px]">
                 {activeTab === 'overview' && (
                   <div className="animate-in fade-in duration-500 space-y-8">
                      <div>
                         <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-widest text-[10px] text-indigo-500">About Mentor</h3>
                         <p className="text-gray-600 leading-relaxed text-lg font-medium whitespace-pre-line">{bio}</p>
                      </div>
                      
                      <div className="pt-8 border-t border-gray-50">
                         <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                           <CheckCircle2 size={20} className="text-emerald-500" />
                           Learning Outcomes
                         </h3>
                         <div className="grid sm:grid-cols-2 gap-y-4 gap-x-12">
                            {[
                               'Direct industry strategic feedback',
                               'Career roadmap and clarity',
                               'Modern portfolio optimization',
                               'Mock interview drill-downs'
                            ].map((item, idx) => (
                               <div key={idx} className="flex items-center gap-3">
                                  <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                                     <CheckCircle2 size={12} strokeWidth={4} />
                                  </div>
                                  <span className="text-sm font-bold text-gray-600">{item}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 )}

                 {activeTab === 'expertise' && (
                   <div className="animate-in fade-in duration-500 space-y-6">
                      <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-widest text-[10px] text-indigo-500">Core Expertise</h3>
                      <div className="flex flex-wrap gap-3">
                        {expertise.length ? (
                          expertise.map((skill, i) => (
                            <span
                              key={i}
                              className="px-6 py-3 bg-indigo-50/50 border border-indigo-100 text-indigo-700 text-xs font-black rounded-xl uppercase tracking-wider"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-400 italic font-medium">No strict expertise listed yet.</p>
                        )}
                      </div>
                   </div>
                 )}

                 {activeTab === 'reviews' && (
                   <div className="animate-in fade-in duration-500 space-y-6">
                      <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-widest text-[10px] text-indigo-500">Mentee Success Stories</h3>
                      <div className="space-y-6">
                         {mockReviews.map((review) => (
                            <div key={review.id} className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-indigo-100 hover:bg-white transition-all group">
                               <div className="flex items-center justify-between mb-4">
                                  <div className="flex gap-1">
                                     {[...Array(5)].map((_, i) => (
                                       <Star key={i} size={14} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'} />
                                     ))}
                                  </div>
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{review.date}</span>
                               </div>
                               <p className="text-gray-700 text-lg font-bold italic mb-6 leading-relaxed">&quot;{review.text}&quot;</p>
                               <div className="flex items-center gap-4 pt-6 border-t border-gray-200/50">
                                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                                     <Image src={review.avatar} alt={review.author} fill className="object-cover" />
                                  </div>
                                  <div>
                                     <span className="font-black text-gray-900 text-lg block leading-none mb-1">{review.author}</span>
                                     <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Verified Mentee</span>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT: Booking Action Block */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
           
           {/* Primary Booking Card */}
           <div className="bg-white border border-gray-200 rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/40 space-y-10 group">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Investment</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-gray-900 tracking-tighter">
                      {price ? `₹${price}` : 'Free'}
                    </span>
                    <span className="text-sm font-bold text-gray-400">/ Session</span>
                 </div>
              </div>

              <div className="space-y-4">
                 {[
                    { icon: <Clock size={18} />, label: '45 Minute Session' },
                    { icon: <CheckCircle2 size={18} />, label: 'Zoom Integration' },
                    { icon: <MessageCircle size={18} />, label: 'Pre-session Chat' }
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm text-gray-700 p-4 bg-gray-50 rounded-2xl group-hover:bg-gray-100/50 transition-colors">
                       <div className="text-indigo-500">{item.icon}</div>
                       <span className="font-bold">{item.label}</span>
                    </div>
                 ))}
              </div>

              <div className="space-y-4 pt-2">
                 <Link
                   href={`/student/booking?id=${mentor._id}`}
                   className="block text-center bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:-translate-y-1 active:scale-95"
                 >
                   Book Reservation
                 </Link>

                 <button className="w-full flex items-center justify-center gap-2 border border-indigo-100 bg-indigo-50/50 text-indigo-700 py-5 rounded-2xl font-black transition-all hover:bg-indigo-50 active:scale-95 leading-none">
                   <MessageCircle size={20} />
                   Send Inquiry
                 </button>
              </div>

              <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Authenticated Email</p>
                    <a href={`mailto:${mentor.email}`} className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors break-all leading-tight block">
                       {mentor.email || 'Email Protected'}
                    </a>
                 </div>
              </div>
           </div>

           {/* Professional Badge */}
           <div className="mt-8 bg-indigo-900 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <User size={80} strokeWidth={1} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-300 mb-4">Verified Professional</h3>
              <p className="text-xs text-indigo-100/70 leading-relaxed font-bold">
                 Expert profile vetted for industry experience and pedagogical excellence.
              </p>
              <div className="mt-8 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-400" strokeWidth={3} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">EdMarg Trusted</span>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}

/* ========================================================= */

function Stat({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow cursor-default">
      {icon}
      <span className="font-bold text-gray-700 text-sm">{label}</span>
    </div>
  );
}