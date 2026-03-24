"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/login`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            role: "student", // important for your multi-portal
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      const user = result.data;
      console.log(user);

      // ✅ ROLE BASED REDIRECT
      if (user.role === "student") {
        router.push("/student/dashboard");
      } else if (user.role === "mentor") {
        router.push("/mentor/dashboard");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface relative overflow-hidden">
      <Link
        href="/"
        className="absolute top-8 left-8 text-2xl font-bold"
      >
        Edmarg
      </Link>

      <div className="w-full max-w-md rounded-xl border bg-surface p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="relative mt-1">
              <Mail
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2.5 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <Lock
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2.5 border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-md disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight size={16} />
          </button>

          {/* ERROR */}
          {error && (
            <p className="text-red-600 text-sm text-center">
              {error}
            </p>
          )}
        </form>

        <p className="text-sm text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}