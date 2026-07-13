'use client';

import React, { useEffect, useState } from 'react';
import MentorDashboardLayout from '@/components/mentor/MentorDashboardLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/api-client';
import ProfileImageUpload from '@/components/common/ProfileImageUpload';
import { UserProfile as ClerkUserProfile } from '@clerk/nextjs';
import { 
  UserCircle, 
  Mail, 
  Briefcase, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe,
  Building2,
  MapPin,
  Settings2,
  IndianRupee,
  Clock3,
  Bell,
  Smartphone,
  Megaphone,
  Calendar,
  CreditCard,
  Trash2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const PREDEFINED_EXPERTISE = [
  'Software Engineering', 'Data Science', 'Machine Learning', 
  'Product Management', 'Design', 'Marketing', 'Finance', 
  'Consulting', 'Entrepreneurship', 'Web Development', 
  'Mobile Development', 'Cybersecurity', 'Cloud Computing',
  'DevOps', 'System Design', 'Interview Prep', 'Career Guidance'
];

const TIMEZONES = [
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'account', label: 'Account & Security', icon: ShieldCheck },
  { id: 'sessions', label: 'Session & Rates', icon: Settings2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Globe },
  { id: 'integrations', label: 'Integrations', icon: Calendar },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

interface MentorSettings {
  name: string;
  profileImage: string;
  bio: string;
  linkedinUrl: string;
  experienceYears: number | '';
  expertise: string[];
  languages: string[];
  currentCompany: string;
  currentTitle: string;
  location: string;
  education: string;

  pricePerSession: number;
  sessionDuration: number;
  autoConfirm: boolean;
  sessionNotes: string;

  timezone: string;
  notificationPreferences: NotificationPreferences;

  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason: string;
}

const DEFAULT_SETTINGS: MentorSettings = {
  name: '',
  profileImage: '',
  bio: '',
  linkedinUrl: '',
  experienceYears: '',
  expertise: [],
  languages: ['English'],
  currentCompany: '',
  currentTitle: '',
  location: '',
  education: '',

  pricePerSession: 0,
  sessionDuration: 45,
  autoConfirm: false,
  sessionNotes: '',

  timezone: 'Asia/Kolkata',
  notificationPreferences: { email: true, sms: false, marketing: false },

  approvalStatus: 'pending',
  rejectionReason: '',
};

function MentorSettingsContent() {
  const { user, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  
  const [settings, setSettings] = useState<MentorSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [calendarConnected, setCalendarConnected] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (TABS.some(t => t.id === hash)) {
        setActiveTab(hash);
      }
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get<any>('/api/v1/users/me', {
          headers: {
            'x-bypass-cache': '1',
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.success || !response.data) {
          throw new Error(response.error || response.message || 'Unable to load settings');
        }

        const userData = response.data;
        const mp = userData.mentorProfile || {};
        const prefs = userData.notificationPreferences || {};

        setSettings({
          name: userData.name || '',
          profileImage: userData.profileImage || '',
          bio: mp.bio || '',
          linkedinUrl: mp.linkedinUrl || '',
          experienceYears: mp.experienceYears || '',
          expertise: mp.expertise || [],
          languages: mp.languages?.length ? mp.languages : ['English'],
          currentCompany: mp.currentCompany || '',
          currentTitle: mp.currentTitle || '',
          location: mp.location || '',
          education: mp.education || '',

          pricePerSession: mp.pricePerSession ?? 0,
          sessionDuration: mp.sessionDuration || 45,
          autoConfirm: mp.autoConfirm ?? false,
          sessionNotes: mp.sessionNotes || '',

          timezone: userData.timezone || 'Asia/Kolkata',
          notificationPreferences: {
            email: prefs.email ?? true,
            sms: prefs.sms ?? false,
            marketing: prefs.marketing ?? false,
          },

          approvalStatus: mp.approvalStatus || 'pending',
          rejectionReason: mp.rejectionReason || '',
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load settings');
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, []);

  const handleSave = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        name: settings.name.trim(),
        profileImage: settings.profileImage,
        linkedinUrl: settings.linkedinUrl,
        bio: settings.bio,
        experienceYears: settings.experienceYears === '' ? 0 : Number(settings.experienceYears),
        expertise: settings.expertise,
        languages: settings.languages,
        currentCompany: settings.currentCompany,
        currentTitle: settings.currentTitle,
        location: settings.location,
        education: settings.education,

        timezone: settings.timezone,
        notificationPreferences: settings.notificationPreferences,
        pricePerSession: Number(settings.pricePerSession),
        sessionDuration: Number(settings.sessionDuration),
        autoConfirm: settings.autoConfirm,
        sessionNotes: settings.sessionNotes.trim(),
      };

      const response = await apiClient.put<any>('/api/v1/users/profile', payload);

      if (!response.success) {
        throw new Error(response.error || response.message || 'Unable to save settings');
      }

      updateUser({ 
        name: settings.name.trim(), 
        profileImage: settings.profileImage, 
        profileImageUpdatedAt: Date.now(), 
        mentorProfile: response.data?.mentorProfile 
      });

      setSuccess('Settings updated successfully.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
    setSettings(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: !prev.notificationPreferences[key]
      }
    }));
  };

  const handleExpertiseToggle = (skill: string) => {
    setSettings(prev => ({
      ...prev,
      expertise: prev.expertise.includes(skill)
        ? prev.expertise.filter(i => i !== skill)
        : [...prev.expertise, skill]
    }));
  };

  if (loading) {
    return (
      <MentorDashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </MentorDashboardLayout>
    );
  }

  // completion logic can go here if needed

  return (
    <MentorDashboardLayout>
      <div className="max-w-7xl mx-auto pb-16 relative">
        <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                Settings & Configuration
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
                Mentor Settings
              </h1>
              <p className="mt-3 text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
                Manage your account, professional profile, session rates, and preferences.
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Verification Status</p>
              <p className={`mt-1 text-base font-extrabold ${settings.approvalStatus === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {settings.approvalStatus.charAt(0).toUpperCase() + settings.approvalStatus.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {settings.approvalStatus !== 'approved' && (
          <div className={`mb-8 rounded-xl p-4 border flex items-start gap-3 ${
            settings.approvalStatus === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <Clock className={`w-5 h-5 mt-0.5 ${settings.approvalStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'}`} />
            <div>
              <p className={`text-sm font-semibold ${settings.approvalStatus === 'rejected' ? 'text-red-900' : 'text-amber-900'}`}>
                {settings.approvalStatus === 'rejected'
                  ? 'Your mentor account is currently rejected.'
                  : 'Your mentor profile is under admin review.'}
              </p>
              <p className={`text-sm mt-1 ${settings.approvalStatus === 'rejected' ? 'text-red-800' : 'text-amber-800'}`}>
                You can update this profile now. Full mentor dashboard access will unlock after approval.
              </p>
              {settings.approvalStatus === 'rejected' && settings.rejectionReason && (
                <p className="text-sm mt-2 text-red-800"><span className="font-semibold">Reason:</span> {settings.rejectionReason}</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200/50 bg-red-50/80 backdrop-blur-sm p-4 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <p className="text-sm font-bold text-red-900">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-200/50 bg-emerald-50/80 backdrop-blur-sm p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            <p className="text-sm font-bold text-emerald-900">{success}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Tabs */}
          <div className="lg:w-64 shrink-0">
            <div className="sticky top-24 flex flex-col gap-2 rounded-[2rem] border border-white/60 bg-white/40 p-4 backdrop-blur-xl shadow-sm">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm' 
                        : 'text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSave} className="space-y-8">
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-10 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-3">
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Personal Information</h2>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">Your public identity on the platform</p>
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                          <input
                            type="text"
                            value={settings.name}
                            onChange={(e) => setSettings(s => ({ ...s, name: e.target.value }))}
                            required
                            className="w-full h-14 px-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input
                              type="email"
                              value={user?.email || ''}
                              disabled
                              className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-400 text-sm font-bold cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Profile Picture</label>
                        <div className="rounded-[2rem] border-2 border-dashed border-emerald-100 bg-emerald-50/30 p-8 transition-all hover:bg-emerald-50/50">
                          <ProfileImageUpload 
                            currentImage={settings.profileImage}
                            userName={settings.name}
                            onUploadSuccess={(url) => setSettings(s => ({ ...s, profileImage: url }))}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-10 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 -rotate-3">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Professional Details</h2>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">Your experience and background</p>
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">LinkedIn Profile</label>
                        <div className="relative">
                          <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input
                            type="url"
                            value={settings.linkedinUrl}
                            onChange={(e) => setSettings(s => ({ ...s, linkedinUrl: e.target.value }))}
                            placeholder="https://www.linkedin.com/in/your-profile"
                            className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Bio / About Me</label>
                        <textarea
                          rows={4}
                          value={settings.bio}
                          onChange={(e) => setSettings(s => ({ ...s, bio: e.target.value }))}
                          placeholder="Tell students about your journey, what you do, and how you can help them..."
                          className="w-full p-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm resize-none leading-relaxed"
                        />
                      </div>
                      
                      <div className="space-y-3 max-w-sm">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Years of Experience</label>
                        <div className="relative">
                          <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input
                            type="number"
                            min="0"
                            value={settings.experienceYears}
                            onChange={(e) => setSettings(s => ({ ...s, experienceYears: e.target.value ? Number(e.target.value) : '' }))}
                            className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-10 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-6">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Work & Education</h2>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">Where you are right now</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Current Company</label>
                        <div className="relative">
                          <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input
                            type="text"
                            value={settings.currentCompany}
                            onChange={(e) => setSettings(s => ({ ...s, currentCompany: e.target.value }))}
                            placeholder="e.g. Google, Microsoft, Startup"
                            className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Current Title</label>
                        <div className="relative">
                          <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input
                            type="text"
                            value={settings.currentTitle}
                            onChange={(e) => setSettings(s => ({ ...s, currentTitle: e.target.value }))}
                            placeholder="e.g. Senior Software Engineer"
                            className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input
                            type="text"
                            value={settings.location}
                            onChange={(e) => setSettings(s => ({ ...s, location: e.target.value }))}
                            placeholder="e.g. San Francisco, CA"
                            className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Education</label>
                        <div className="relative">
                          <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input
                            type="text"
                            value={settings.education}
                            onChange={(e) => setSettings(s => ({ ...s, education: e.target.value }))}
                            placeholder="e.g. BS Computer Science, MIT"
                            className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-10 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-6">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Areas of Expertise</h2>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">What you can mentor on</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-3">
                        {PREDEFINED_EXPERTISE.map(skill => {
                          const isSelected = settings.expertise.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleExpertiseToggle(skill)}
                              className={`px-5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-105' 
                                  : 'bg-white/60 text-slate-500 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50'
                              }`}
                            >
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* ACCOUNT & SECURITY TAB */}
              {activeTab === 'account' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-6 px-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-3">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Account & Security</h2>
                          <p className="text-sm text-slate-600 font-medium">Manage passwords, 2FA, and connected accounts</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full flex justify-start overflow-x-auto rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                      <ClerkUserProfile 
                        routing="hash" 
                        appearance={{
                          elements: {
                            rootBox: "w-full",
                            cardBox: "w-full shadow-none",
                            card: "w-full shadow-none"
                          }
                        }}
                      />
                    </div>
                  </section>
                </div>
              )}

              {/* SESSIONS & RATES TAB */}
              {activeTab === 'sessions' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-8 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 -rotate-3">
                        <Settings2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Session & Rates</h2>
                        <p className="text-sm text-slate-600 font-medium">How students book and pay you</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Price Per Session (INR)</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={settings.pricePerSession}
                              onChange={(e) => setSettings(s => ({ ...s, pricePerSession: Number(e.target.value) }))}
                              className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Session Duration</label>
                          <div className="relative">
                            <Clock3 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                            <select
                              value={settings.sessionDuration}
                              onChange={(e) => setSettings(s => ({ ...s, sessionDuration: Number(e.target.value) }))}
                              className="w-full h-14 pl-14 pr-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm appearance-none cursor-pointer"
                            >
                              {[15, 30, 45, 60, 90, 120].map((duration) => (
                                <option key={duration} value={duration}>{duration} minutes</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-6 sm:p-8 rounded-[2rem] bg-emerald-50/50 border border-emerald-100 ring-1 ring-emerald-500/5">
                        <div className="max-w-lg">
                          <h4 className="text-sm font-bold text-slate-950 uppercase tracking-tight">Auto-Confirm Bookings</h4>
                          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                            Automatically accept all session requests without manual approval. Recommended for high-volume mentors.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettings(s => ({ ...s, autoConfirm: !s.autoConfirm }))}
                          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 shadow-inner shrink-0 ${
                            settings.autoConfirm ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-md ${
                              settings.autoConfirm ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Default Session Note</label>
                        <textarea
                          rows={4}
                          value={settings.sessionNotes}
                          onChange={(e) => setSettings(s => ({ ...s, sessionNotes: e.target.value }))}
                          placeholder="Add a reusable note students should know before booking."
                          className="w-full p-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-8 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-6">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Notifications</h2>
                        <p className="text-sm text-slate-600 font-medium">Manage how we contact you</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {[
                        { key: 'email', label: 'Email Notifications', desc: 'Receive booking confirmations and messages via email', icon: Mail },
                        { key: 'sms', label: 'SMS Alerts', desc: 'Get text messages for upcoming session reminders', icon: Smartphone },
                        { key: 'marketing', label: 'Platform Updates', desc: 'Tips, features, and platform news', icon: Megaphone },
                      ].map(({ key, label, desc, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/60 border border-white hover:border-emerald-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{label}</h4>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{desc}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleNotificationToggle(key as keyof NotificationPreferences)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                              settings.notificationPreferences[key as keyof NotificationPreferences] ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                                settings.notificationPreferences[key as keyof NotificationPreferences] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* PREFERENCES TAB */}
              {activeTab === 'preferences' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-8 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 rotate-3">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Account Preferences</h2>
                        <p className="text-sm text-slate-600 font-medium">Localization and global settings</p>
                      </div>
                    </div>
                    
                    <div className="max-w-md space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Timezone</label>
                      <div className="relative">
                        <select
                          value={settings.timezone}
                          onChange={(e) => setSettings(s => ({ ...s, timezone: e.target.value }))}
                          className="w-full h-14 px-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm appearance-none cursor-pointer"
                        >
                          {TIMEZONES.map(tz => (
                            <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Globe className="h-5 w-5 text-slate-300" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 ml-1">All your bookings will be displayed in this timezone.</p>
                    </div>
                  </section>
                </div>
              )}

              {/* INTEGRATIONS TAB */}
              {activeTab === 'integrations' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-8 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 -rotate-3">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Integrations</h2>
                        <p className="text-sm text-slate-600 font-medium">Connect external services</p>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="p-6 rounded-[2rem] bg-white/60 border border-white shadow-sm flex flex-col justify-between min-h-[180px]">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <Calendar className="h-6 w-6 text-blue-500" />
                            <h3 className="font-bold text-slate-900">Google Calendar</h3>
                          </div>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Sync your bookings automatically and prevent double-booking.
                          </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                          <span className={`text-xs font-bold uppercase tracking-wider ${calendarConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {calendarConnected ? 'Connected' : 'Not Connected'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCalendarConnected(!calendarConnected)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              calendarConnected ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            }`}
                          >
                            {calendarConnected ? 'Disconnect' : 'Connect'}
                          </button>
                        </div>
                      </div>

                      <div className="p-6 rounded-[2rem] bg-white/60 border border-white shadow-sm flex flex-col justify-between min-h-[180px]">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <CreditCard className="h-6 w-6 text-indigo-500" />
                            <h3 className="font-bold text-slate-900">Stripe Payouts</h3>
                          </div>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Receive payouts directly to your bank account after completed sessions.
                          </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                          <span className={`text-xs font-bold uppercase tracking-wider ${stripeConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
                            {stripeConnected ? 'Active' : 'Pending Setup'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setStripeConnected(!stripeConnected)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              stripeConnected ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/20'
                            }`}
                          >
                            {stripeConnected ? 'Manage' : 'Setup Payouts'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* DANGER ZONE TAB */}
              {activeTab === 'danger' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <section className="rounded-[3rem] border border-red-100 bg-red-50/50 backdrop-blur-3xl p-8 sm:p-10 shadow-sm ring-1 ring-red-500/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div>
                        <h2 className="text-xl font-extrabold text-red-900 tracking-tight">Danger Zone</h2>
                        <p className="mt-2 text-sm text-red-700/80 font-medium max-w-md">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-red-200 text-sm font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors hover:border-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {/* Submit Action */}
              {activeTab !== 'account' && activeTab !== 'danger' && activeTab !== 'integrations' && (
                <div className="sticky bottom-8 z-10 flex flex-col sm:flex-row items-center justify-end gap-6 rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-3xl ring-1 ring-black/[0.03]">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-slate-950 px-10 text-base font-bold text-white shadow-xl shadow-slate-950/20 transition-all hover:bg-slate-800 hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    Save Configuration
                  </button>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </MentorDashboardLayout>
  );
}

export default function MentorSettingsPage() {
  return (
    <ProtectedRoute requiredRole="mentor">
      <MentorSettingsContent />
    </ProtectedRoute>
  );
}
