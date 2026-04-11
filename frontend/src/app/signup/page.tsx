"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Phone, User, GraduationCap, Users, Eye, EyeOff } from "lucide-react";
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
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

  const API_BASE_URL = 'https://edmarg.onrender.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const payload: Record<string, unknown> = {
      name,
      email,
      password,
      phoneNumber,
      role,
    };

    if (role === "student") {
      payload.studentProfile = {
        classLevel,
        interests: interests.split(",").map((i) => i.trim()).filter((i) => i !== ""),
      };
    } else {
      payload.mentorProfile = {
        expertise: expertise.split(",").map((e) => e.trim()).filter((e) => e !== ""),
        bio,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Signup failed");
      }

      const user = result.data;
      const token = result.token || result.data?.token;

      // Save to localStorage
      if (token) {
        localStorage.setItem("token", token);
      }
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess(`Welcome, ${user?.name || name}! Your account was created.`);
      toast.success(`Welcome, ${user?.name || name}! Your account was created.`);

      setTimeout(() => {
        if (role === "student") {
          router.push("/student/dashboard");
        } else if (role === "mentor") {
          router.push("/mentor/dashboard");
        }
      }, 1500);

      setName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
      setClassLevel("");
      setInterests("");
      setExpertise("");
      setBio("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to create account";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-b from-emerald-50 via-green-50/40 to-white flex flex-col">
      {/* Layered background accents */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-emerald-200/55 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-cyan-100/60 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-4 border-b border-emerald-100/50 bg-white/70 backdrop-blur-md">
        <Link href="/" className="group flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-emerald-300 to-green-400 text-sm font-extrabold text-slate-900 shadow-[0_10px_24px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:-translate-y-0.5">
            E
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">EdMarg</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="bg-white/85 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-[0_30px_70px_rgba(16,185,129,0.12)]">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Create account</h1>
              <p className="text-slate-600 text-sm leading-relaxed">Join EdMarg to start learning or mentoring</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div className="flex gap-3 p-1.5 bg-slate-100/80 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setRole("student")}
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
                  onClick={() => setRole("mentor")}
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

              {/* Full Name */}
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

              {/* Email */}
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

              {/* Phone Number */}
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
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-sm shadow-slate-100"
                  />
                </div>
              </div>

              {/* Dynamic Profile Fields */}
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
                </>
              )}

              {/* Password */}
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
                    minLength={8}
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

              {/* Confirm Password */}
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
                    minLength={8}
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

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-xl">
                  <p className="text-sm font-medium text-emerald-700">{success}</p>
                </div>
              )}

              {/* Submit Button */}
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
        <p>© 2024 EdMarg. All rights reserved.</p>
      </div>
    </div>
  );
}
