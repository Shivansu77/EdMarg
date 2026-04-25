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
  const [success, setSuccess] = useState("");

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

    setSuccess(`Welcome, ${createdUser.name || name}! Your account was created.`);
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
    setSuccess("");

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
    <div className="min-h-screen relative overflow-hidden bg-linear-to-b from-emerald-50 via-green-50/40 to-white flex flex-col">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-emerald-200/55 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyan-100/60 blur-[100px]" />
      </div>

      <div className="relative z-10 px-6 py-4 border-b border-emerald-100/50 bg-white/70 backdrop-blur-md">
        <Logo />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="bg-white/85 backdrop-blur-xl border border-white/60 p-8 rounded-4xl shadow-[0_30px_70px_rgba(16,185,129,0.12)]">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Create account</h1>
              <p className="text-slate-600 text-sm leading-relaxed">Join EdMarg to start learning or mentoring</p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 font-bold text-slate-700 shadow-sm transition-all hover:border-emerald-200 hover:bg-slate-50"
            >
              <Image
                src="/google-logo.png"
                alt="Google"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span>Continue with Google as {role}</span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/85 px-2 text-slate-400 font-bold">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex gap-3 p-1.5 bg-slate-100/80 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => handleRoleChange("student")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-sm transition-all ${
                    role === "student"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap size={16} />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("mentor")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-sm transition-all ${
                    role === "mentor"
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Users size={16} />
                  Mentor
                </button>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2">
                  Phone number
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit phone number"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                  />
                </div>
              </div>

              {role === "student" ? (
                <>
                  <div>
                    <label htmlFor="classLevel" className="block text-sm font-semibold text-slate-900 mb-2">
                      Class / Level
                    </label>
                    <input
                      id="classLevel"
                      type="text"
                      value={classLevel}
                      onChange={(e) => setClassLevel(e.target.value)}
                      placeholder="e.g. Class 12, Graduate"
                      className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="interests" className="block text-sm font-semibold text-slate-900 mb-2">
                      Interests (comma separated)
                    </label>
                    <input
                      id="interests"
                      type="text"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="e.g. Design, Tech, Space"
                      className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="expertise" className="block text-sm font-semibold text-slate-900 mb-2">
                      Expertise (comma separated)
                    </label>
                    <input
                      id="expertise"
                      type="text"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      placeholder="e.g. Career Coaching, Engineering"
                      className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-semibold text-slate-900 mb-2">
                      Short bio
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100 resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedinUrl" className="block text-sm font-semibold text-slate-900 mb-2">
                      LinkedIn profile link
                    </label>
                    <div className="relative">
                      <Link2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="linkedinUrl"
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://www.linkedin.com/in/your-profile"
                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                        required={role === "mentor"}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                    minLength={4}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                    minLength={4}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-xl">
                  <p className="text-sm font-medium text-emerald-700">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-linear-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 disabled:from-slate-300 disabled:to-slate-300 text-slate-900 font-bold rounded-xl transition-all duration-200 shadow-[0_12px_24px_rgba(16,185,129,0.25)] hover:shadow-[0_16px_32px_rgba(16,185,129,0.35)] disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">OR</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <p className="text-center text-sm font-medium text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 py-6 text-center text-sm font-medium text-slate-500">
        <p>&copy; {new Date().getFullYear()} EdMarg. All rights reserved.</p>
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
