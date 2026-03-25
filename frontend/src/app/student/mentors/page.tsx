'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Star } from 'lucide-react';

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
  };
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/users/browsementor`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load mentors (${response.status})`);
        }

        const result = await response.json();
        setMentors(Array.isArray(result?.data) ? result.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to fetch mentors right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const hasMentors = useMemo(() => mentors.length > 0, [mentors]);

  return (
    <DashboardLayout userName="Mentors">
      <section className="space-y-6 pb-8">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-[48px] leading-none font-extrabold tracking-[-0.03em] text-[#303546]">Find Your Mentor</h2>
            <p className="mt-2 text-[22px] text-[#6e768b] max-w-3xl">
              Connect with industry experts curated for your career goals.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-[#e7e9f0] bg-white p-8 text-[#5c6479] text-[18px]">
            Loading mentor cards from backend...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#ffd9dc] bg-[#fff6f7] p-8">
            <p className="text-[20px] font-bold text-[#b4233f]">Could not load mentors</p>
            <p className="mt-2 text-[17px] text-[#6e768b]">{error}</p>
          </div>
        ) : !hasMentors ? (
          <div className="rounded-2xl border border-[#e7e9f0] bg-white p-8 text-[#5c6479] text-[18px]">
            No mentors found yet. Add mentor users in backend to populate cards.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {mentors.map((mentor) => {
              const tags = mentor.mentorProfile?.expertise?.slice(0, 2) || [];
              const rating = mentor.mentorProfile?.rating ?? 0;
              const bio = mentor.mentorProfile?.bio || 'Career mentor available for personalized sessions.';

              return (
                <article
                  key={mentor._id}
                  className="rounded-2xl border border-[#e7e9f0] bg-white p-5 shadow-[0_8px_30px_rgba(16,24,40,0.04)]"
                >
                  <div className="relative">
                    <img
                      src={mentor.profileImage || `https://ui-avatars.com/api/?background=e9ecf5&color=303546&name=${encodeURIComponent(mentor.name)}`}
                      alt={mentor.name}
                      className="h-44 w-full rounded-xl object-cover"
                    />
                    <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[12px] font-bold text-[#303546]">
                      <Star size={12} className="text-[#f5a524] fill-[#f5a524]" />
                      {Number(rating).toFixed(1)}
                    </div>
                  </div>

                  <h3 className="mt-4 text-[32px] leading-none tracking-[-0.02em] font-extrabold text-[#303546]">{mentor.name}</h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <span key={`${mentor._id}-${tag}`} className="rounded-md bg-[#ece8ff] px-2.5 py-1 text-[12px] font-bold text-[#6246d6]">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-md bg-[#eef1f6] px-2.5 py-1 text-[12px] font-bold text-[#616a80]">General</span>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-3 text-[17px] leading-snug text-[#666f84]">{bio}</p>

                  <div className="mt-4 flex items-center justify-between text-[14px] text-[#7a8296]">
                    <span>{mentor.mentorProfile?.experienceYears ?? 0} yrs experience</span>
                    <span>
                      {mentor.mentorProfile?.pricePerSession != null
                        ? `$${mentor.mentorProfile.pricePerSession}/session`
                        : 'Pricing on request'}
                    </span>
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button className="flex-1 rounded-full bg-[#eef1f6] px-4 py-2.5 text-[17px] font-bold text-[#4f5a72]">View Profile</button>
                    <button className="flex-1 rounded-full bg-[#5b45dd] px-4 py-2.5 text-[17px] font-bold text-white">Connect</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
