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
  CheckCircle2,
  Video,
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

function StudentMentorProfileContent() {
  const { user } = useAuth();
  const params = useParams();
  const mentorId = params.id as string;

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'expertise' | 'reviews'>('overview');
  const [favorite, setFavorite] = useState(false);

  const mockReviews: Review[] = [
    {
      id: '1',
      author: 'Sarah Johnson',
      rating: 5,
      text: 'Excellent guidance on career strategy. Very structured and actionable feedback.',
      date: '2 weeks ago',
      avatar: 'https://ui-avatars.com/api/?background=f3f4f6&color=4f46e5&name=SJ&size=40',
    },
    {
      id: '2',
      author: 'Mike Chen',
      rating: 5,
      text: 'Thorough portfolio review and practical insights. Highly recommended.',
      date: '1 month ago',
      avatar: 'https://ui-avatars.com/api/?background=f3f4f6&color=4f46e5&name=MC&size=40',
    },
  ];

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
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

  return (
    <div className="animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <Link
        href="/student/mentors"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ChevronLeft size={16} />
        Back to Mentors
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Header */}
          <div className="flex gap-8 items-start">
            <div className="relative flex-shrink-0">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                <Image
                  src={mentor.profileImage || `https://ui-avatars.com/api/?background=f3f4f6&color=4f46e5&name=${encodeURIComponent(mentor.name)}&size=300`}
                  alt={mentor.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex-1 pt-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{mentor.name}</h1>
              <p className="text-lg text-gray-600 mb-6">{expertise[0] || 'Professional Mentor'}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Briefcase size={16} className="text-gray-400" />
                  <span className="font-medium">{experience}+ years experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="font-medium">{rating.toFixed(1)} ({sessions} sessions)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setFavorite(!favorite)}
                  className={`p-2 rounded-lg border transition-colors ${
                    favorite
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-600'
                  }`}
                >
                  <Heart size={18} className={favorite ? 'fill-current' : ''} />
                </button>
                <button className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              {['overview', 'expertise', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 font-medium text-sm capitalize transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'text-gray-900 border-gray-900'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in duration-300">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">About</h3>
                  <p className="text-gray-600 leading-relaxed">{bio}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    What You'll Learn
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {[
                      'Industry insights & feedback',
                      'Career roadmap planning',
                      'Portfolio optimization',
                      'Interview preparation'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'expertise' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {expertise.length ? (
                    expertise.map((skill, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No expertise listed yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-4 italic">"{review.text}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border border-gray-200">
                        <Image src={review.avatar} alt={review.author} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{review.author}</p>
                        <p className="text-xs text-gray-500">Verified Student</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Pricing Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price per session</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-gray-900">{price ? `₹${price}` : 'Free'}</span>
                <span className="text-sm text-gray-500">/ session</span>
              </div>

              <ul className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {[
                  { icon: <Clock size={16} />, label: '45 minutes' },
                  { icon: <Video size={16} />, label: 'Video call' },
                  { icon: <MessageCircle size={16} />, label: 'Chat support' }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-gray-400">{item.icon}</span>
                    {item.label}
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <Link
                  href={`/student/booking?id=${mentor._id}`}
                  className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors"
                >
                  Book Session
                </Link>
                <button className="w-full py-3 rounded-lg border border-gray-200 text-gray-900 font-semibold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={16} />
                  Message
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</p>
              <a href={`mailto:${mentor.email}`} className="text-sm font-medium text-gray-900 hover:text-gray-600 break-all">
                {mentor.email || 'Email Protected'}
              </a>
            </div>

            {/* Verification Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">Verified</p>
              </div>
              <p className="text-xs text-emerald-700">EdMarg certified mentor with verified credentials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
