'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/utils/api-client';
import ProfileImageUpload from '@/components/common/ProfileImageUpload';
import { useAuth } from '@/context/AuthContext';
import { UserProfile as ClerkUserProfile } from '@clerk/nextjs';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bell,
  Trash2,
  Globe,
  Mail,
  Smartphone,
  Megaphone,
  Eye,
  EyeOff,
  Settings,
  UserCircle,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

const CLASS_LEVELS = [
  'High School',
  'Undergraduate / College',
  'Graduate / Masters',
  'Professional / Corporate',
  'Other'
];

const PREDEFINED_INTERESTS = [
  'Software Engineering', 'Data Science', 'Machine Learning', 
  'Product Management', 'Design', 'Marketing', 'Finance', 
  'Consulting', 'Entrepreneurship', 'Web Development', 
  'Mobile Development', 'Cybersecurity', 'Cloud Computing'
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

const NAME_MAX_LENGTH = 80;

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

interface StudentSettings {
  timezone: string;
  notificationPreferences: NotificationPreferences;
  profileVisibility: 'public' | 'private';
  name: string;
  profileImage: string;
  classLevel: string;
  interests: string[];
}

const DEFAULT_SETTINGS: StudentSettings = {
  timezone: 'Asia/Kolkata',
  notificationPreferences: { email: true, sms: false, marketing: false },
  profileVisibility: 'public',
  name: '',
  profileImage: '',
  classLevel: '',
  interests: [],
};

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'account', label: 'Account & Security', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

function StudentSettingsContent() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [settings, setSettings] = useState<StudentSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Read hash from URL to set active tab
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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get<any>('/api/v1/users/me');
      if (!response.success || !response.data) {
        throw new Error(response.error || response.message || 'Unable to load settings');
      }

      const userData = response.data;
      const prefs = userData.notificationPreferences || {};

      setSettings({
        timezone: userData.timezone || 'Asia/Kolkata',
        notificationPreferences: {
          email: prefs.email ?? true,
          sms: prefs.sms ?? false,
          marketing: prefs.marketing ?? false,
        },
        profileVisibility: userData.profileVisibility || 'public',
        name: userData.name || '',
        profileImage: userData.profileImage || '',
        classLevel: userData.studentProfile?.classLevel || '',
        interests: userData.studentProfile?.interests || [],
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleSave = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const trimmedName = settings.name.trim();

      if (!trimmedName) {
        throw new Error('Name is required.');
      }
      
      if (activeTab === 'profile') {
        if (!settings.classLevel) {
          throw new Error('Please select your class level.');
        }
        if (settings.interests.length === 0) {
          throw new Error('Please add at least one interest.');
        }
      }

      const payload = {
        timezone: settings.timezone,
        notificationPreferences: settings.notificationPreferences,
        profileVisibility: settings.profileVisibility,
        name: trimmedName,
        profileImage: settings.profileImage,
        classLevel: settings.classLevel,
        interests: settings.interests,
      };

      const response = await apiClient.put('/api/v1/users/profile', payload);

      if (!response.success) {
        throw new Error(response.error || response.message || 'Unable to save settings');
      }

      updateUser({ name: trimmedName, profileImage: settings.profileImage, profileImageUpdatedAt: Date.now() });

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

  const handleInterestToggle = (interest: string) => {
    setSettings(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  if (loading) {
    return (
      <DashboardLayout userName="Settings">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </DashboardLayout>
    );
  }

  // Calculate completion profile
  const completedFields = [
    Boolean(settings.name.trim()),
    Boolean(settings.profileImage),
    Boolean(settings.classLevel),
    settings.interests.length > 0,
  ].filter(Boolean).length;
  const completionPct = Math.round((completedFields / 4) * 100);

  return (
    <DashboardLayout userName="Settings">
      <div className="max-w-7xl mx-auto pb-16 relative">
        <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                Settings & Configuration
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
                Student Settings
              </h1>
              <p className="mt-3 text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
                Manage your account, profile, security, and preferences.
              </p>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Profile Completion</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${completionPct}%` }} />
                </div>
                <p className="text-sm font-extrabold text-slate-900">{completionPct}%</p>
              </div>
            </div>
          </div>
        </div>

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
                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
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
                            maxLength={NAME_MAX_LENGTH}
                            required
                            className="w-full h-14 px-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm"
                          />
                          <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{settings.name.length}/{NAME_MAX_LENGTH} Characters</p>
                          </div>
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
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Academic Background</h2>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">Your current education status</p>
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-3 max-w-md">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Current Class Level</label>
                        <div className="relative">
                          <select
                            value={settings.classLevel}
                            onChange={(e) => setSettings(s => ({ ...s, classLevel: e.target.value }))}
                            className="w-full h-14 px-6 rounded-2xl border border-white bg-white/60 text-slate-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-400 transition-all shadow-sm appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Select your education level...</option>
                            {CLASS_LEVELS.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Sparkles className="h-5 w-5 text-slate-300" />
                          </div>
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
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Career Interests</h2>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">What you want to explore or learn</p>
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">Select the fields you are interested in exploring or getting mentorship in. These help us curate your dashboard experience.</p>
                      
                      <div className="flex flex-wrap gap-3">
                        {PREDEFINED_INTERESTS.map(interest => {
                          const isSelected = settings.interests.includes(interest);
                          return (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => handleInterestToggle(interest)}
                              className={`px-5 py-2.5 rounded-xl text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-105' 
                                  : 'bg-white/60 text-slate-500 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50'
                              }`}
                            >
                              {interest}
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
                        { key: 'email', label: 'Email Notifications', desc: 'Receive booking confirmations and mentor messages via email', icon: Mail },
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
                      <p className="text-xs text-slate-500 ml-1">All your bookings and schedules will be displayed in this timezone.</p>
                    </div>
                  </section>

                  <section className="rounded-[3rem] border border-white/60 bg-white/40 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03]">
                    <div className="mb-8 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 -rotate-3">
                        <Settings className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">Privacy Settings</h2>
                        <p className="text-sm text-slate-600 font-medium">Control who can see your profile</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, profileVisibility: 'public' }))}
                        className={`flex flex-col items-start p-6 rounded-[2rem] border transition-all text-left ${
                          settings.profileVisibility === 'public'
                            ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'bg-white/60 border-white hover:border-emerald-100 hover:bg-emerald-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Eye className={`w-5 h-5 ${settings.profileVisibility === 'public' ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className={`font-bold ${settings.profileVisibility === 'public' ? 'text-emerald-900' : 'text-slate-700'}`}>
                            Public Profile
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Mentors can view your full academic background and career interests when you request a session.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, profileVisibility: 'private' }))}
                        className={`flex flex-col items-start p-6 rounded-[2rem] border transition-all text-left ${
                          settings.profileVisibility === 'private'
                            ? 'bg-slate-900 border-slate-800 ring-2 ring-slate-900/20 shadow-sm'
                            : 'bg-white/60 border-white hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <EyeOff className={`w-5 h-5 ${settings.profileVisibility === 'private' ? 'text-white' : 'text-slate-400'}`} />
                          <span className={`font-bold ${settings.profileVisibility === 'private' ? 'text-white' : 'text-slate-700'}`}>
                            Private Profile
                          </span>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${settings.profileVisibility === 'private' ? 'text-slate-300' : 'text-slate-500'}`}>
                          Mentors will only see your name and profile picture. Your background details remain hidden.
                        </p>
                      </button>
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
              {activeTab !== 'account' && activeTab !== 'danger' && (
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
    </DashboardLayout>
  );
}

export default function StudentSettingsPage() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentSettingsContent />
    </ProtectedRoute>
  );
}
