"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Phone, User, GraduationCap, Users, Eye, EyeOff, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getPostAuthFallbackPath, getSafePostAuthPath } from "@/utils/auth-redirect";
import { resolveApiBaseUrl, resolveBackendBaseUrl } from "@/utils/api-base";
import { validators } from "@/utils/validators";
import Logo from "@/components/Logo";

interface SignupResponse {
  success?: boolean;
  message?: string;
  error?: string;
  token?: string;
  data?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: "student" | "mentor" | "admin";
    profileImage?: string;
    phoneNumber?: string;
    studentProfile?: {
      classLevel?: string;
      interests?: string[];
    };
    mentorProfile?: {
      linkedinUrl?: string;
      expertise?: string[];
      approvalStatus?: "pending" | "approved" | "rejected";
    };
    token?: string;
  };
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [role, setRole] = useState<"student" | "mentor">("student");
  const [classLevel, setClassLevel] = useState("");
  const [interests, setInterests] = useState("");
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const API_BASE_URL = resolveApiBaseUrl();
  const backendBaseUrl = resolveBackendBaseUrl();
  const redirectParam = searchParams.get("redirect") ?? searchParams.get("callbackUrl");

  useEffect(() => {
    if (!user) {
      return;
    }

    const fallbackPath = getPostAuthFallbackPath(user);
    router.replace(getSafePostAuthPath(redirectParam, fallbackPath));
  }, [redirectParam, router, user]);

  const handleGoogleSignup = () => {
    setLoading(true);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const state = encodeURIComponent(
      JSON.stringify({
        frontendOrigin: currentOrigin,
        redirectPath: redirectParam,
        intendedRole: role,
      })
    );

    if (clientId) {
      const redirectUri = encodeURIComponent(`${backendBaseUrl}/api/v1/users/auth/google/callback`);
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&access_type=offline&prompt=select_account`;
      window.location.assign(authUrl);
      return;
    }

    window.location.assign(`${backendBaseUrl}/api/v1/users/auth/google?state=${state}`);
  };

  const handleRoleChange = (nextRole: "student" | "mentor") => {
    if (nextRole === role) {
      return;
    }

    setRole(nextRole);
    setError("");

    if (nextRole === "student") {
      setExpertise("");
      setBio("");
      setLinkedinUrl("");
    } else {
      setClassLevel("");
      setInterests("");
    }
  };

  const readSignupResponse = async (response: Response) => {
    const rawBody = await response.text();
    let result: SignupResponse = {};

    if (rawBody) {
      try {
        result = JSON.parse(rawBody) as SignupResponse;
      } catch {
        throw new Error("Received an invalid signup response");
      }
    }

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || "Signup failed");
    }

    if (!result.data?._id || !result.data.name || !result.data.email || !result.data.role) {
      throw new Error("Signup response was incomplete");
    }

    return result;
  };

  const applySuccessfulSignup = (result: SignupResponse) => {
    if (!result.data) {
      throw new Error("Signup response was incomplete");
    }

    const createdUser = {
      _id: result.data._id,
      name: result.data.name,
      email: result.data.email,
      role: result.data.role,
      profileImage: result.data.profileImage,
      phoneNumber: result.data.phoneNumber,
      studentProfile: result.data.studentProfile,
      mentorProfile: result.data.mentorProfile,
    };

    const token = result.token || result.data.token;

    localStorage.setItem("user", JSON.stringify(createdUser));
    if (token) {
      localStorage.setItem("token", token);
      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      localStorage.removeItem("token");
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    }

    window.dispatchEvent(new Event("edmarg-auth-user-change"));

    toast.success(`Welcome, ${createdUser.name || name}! Your account was created.`);

    const fallbackPath = getPostAuthFallbackPath(createdUser);
    router.replace(getSafePostAuthPath(redirectParam, fallbackPath));

    setName("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setConfirmPassword("");
    setClassLevel("");
    setInterests("");
    setExpertise("");
    setBio("");
    setLinkedinUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!validators.email(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      setLoading(false);
      return;
    }

    if (normalizedPhoneNumber && normalizedPhoneNumber.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        name,
        email,
        password,
        phoneNumber: normalizedPhoneNumber,
        role,
      };

      if (role === "student") {
        payload.studentProfile = {
          classLevel,
          interests: interests.split(",").map((value) => value.trim()).filter((value) => value !== ""),
        };
      } else {
        payload.mentorProfile = {
          expertise: expertise.split(",").map((value) => value.trim()).filter((value) => value !== ""),
          bio,
          linkedinUrl: linkedinUrl.trim(),
        };
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await readSignupResponse(response);
      applySuccessfulSignup(result);
    } catch (err) {
      const rawErrorMessage = err instanceof Error ? err.message : "Unable to create account";
      const errorMessage = rawErrorMessage.toLowerCase().includes("failed to fetch")
        ? `Unable to reach backend at ${API_BASE_URL}. Start backend server or update frontend/.env.local backend URL.`
        : rawErrorMessage;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col">
      {/* Dynamic Background Accents */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-48 -right-48 h-[40rem] w-[40rem] rounded-full bg-emerald-200/20 blur-[120px]" />
        <div className="absolute top-1/2 -left-48 h-[50rem] w-[50rem] rounded-full bg-cyan-100/30 blur-[140px]" />
      </div>

      <div className="relative z-10 border-b border-white/60 bg-white/40 px-6 py-5 backdrop-blur-xl sm:px-12">
        <Logo />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl animate-fade-up">
          <div className="rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-[0_28px_70px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] backdrop-blur-3xl sm:p-9">
            <div className="mb-8 text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Join the Community
              </div>
              <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-[2rem]">
                Create your <span className="text-emerald-600">EdMarg</span> account
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-7 text-slate-600 sm:text-[15px]">
                Step into a world of expert guidance and structured professional growth.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="group mb-8 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-xl hover:shadow-slate-200/50 active:scale-95"
            >
              <div className="relative h-7 w-7 shrink-0">
                <Image
                  src="/google-logo.png"
                  alt="Google"
                  fill
                  className="object-contain transition-transform group-hover:scale-110"
                />
              </div>
              <span>Continue with Google as {role}</span>
            </button>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/60"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.18em]">
                <span className="bg-white/10 px-4 font-semibold text-slate-400 backdrop-blur-sm">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-7 flex gap-2 rounded-2xl bg-slate-100/50 p-1.5 ring-1 ring-black/[0.03] backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => handleRoleChange("student")}
                  className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 ${
                    role === "student"
                      ? "bg-white text-emerald-600 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-100"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap size={18} />
                  I am a Student
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("mentor")}
                  className={`flex-1 flex items-center justify-center gap-2.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-300 ${
                    role === "mentor"
                      ? "bg-white text-emerald-600 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-100"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Users size={18} />
                  I am a Mentor
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="h-12 w-full rounded-2xl border border-white bg-white/60 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-2xl border border-white bg-white/60 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit number"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      className="h-12 w-full rounded-2xl border border-white bg-white/60 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                    />
                  </div>
                </div>

                {role === "student" ? (
                  <div className="space-y-2">
                    <label htmlFor="classLevel" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Class / Level
                    </label>
                    <input
                      id="classLevel"
                      type="text"
                      value={classLevel}
                      onChange={(e) => setClassLevel(e.target.value)}
                      placeholder="e.g. Class 12"
                      className="h-12 w-full rounded-2xl border border-white bg-white/60 px-4 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label htmlFor="expertise" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Expertise
                    </label>
                    <input
                      id="expertise"
                      type="text"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      placeholder="e.g. Engineering"
                      className="h-12 w-full rounded-2xl border border-white bg-white/60 px-4 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                      required
                    />
                  </div>
                )}
              </div>

              {role === "student" ? (
                <div className="space-y-2">
                  <label htmlFor="interests" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Interests (comma separated)
                  </label>
                  <input
                    id="interests"
                    type="text"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    placeholder="e.g. Design, Tech, Space"
                    className="h-12 w-full rounded-2xl border border-white bg-white/60 px-4 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label htmlFor="bio" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Short Bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full resize-none rounded-2xl border border-white bg-white/60 p-4 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="linkedinUrl" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      LinkedIn Profile Link
                    </label>
                    <div className="relative">
                      <Link2 size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        id="linkedinUrl"
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://www.linkedin.com/in/..."
                        className="h-12 w-full rounded-2xl border border-white bg-white/60 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                        required={role === "mentor"}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="password" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 w-full rounded-2xl border border-white bg-white/60 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                      minLength={4}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 w-full rounded-2xl border border-white bg-white/60 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-300 shadow-sm transition-all focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5"
                      minLength={4}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl animate-shake">
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-xl shadow-slate-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating Account...
                  </>
                ) : (
                  "Create EdMarg Account"
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200/60 pt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-emerald-600 transition-all decoration-2 underline-offset-4 hover:text-emerald-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 py-8 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        <p>&copy; {new Date().getFullYear()} EdMarg. Empowering professional excellence.</p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent"></div></div>}>
      <SignupContent />
    </React.Suspense>
  );
}
