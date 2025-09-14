"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password strength checker
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ["bg-red-500", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-400"];
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Simulate API delay
    setTimeout(async () => {
      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password }),
        });

        if (res.ok) {
          alert("Registrasi berhasil! Silakan login.");
        } else {
          const data = await res.json();
          setErrors({ general: data.error || "Gagal registrasi" });
        }
      } catch (error) {
        setErrors({ general: "Network error occurred" });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>
      
      <div className="relative w-full max-w-lg">
        {/* Main card */}
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl shadow-purple-900/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 rounded-3xl blur-lg opacity-30" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-400">Join us and start your journey today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-800/70 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 group-hover:border-gray-500/70"
                  placeholder="Enter your full name"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-800/70 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 group-hover:border-gray-500/70"
                  placeholder="Enter your email address"
                  required
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>

            {/* Phone field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                Phone Number
                <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded-full">Optional</span>
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-800/70 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 group-hover:border-gray-500/70"
                  placeholder="Enter your phone number"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-pink-400" />
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-12 py-4 bg-gray-800/70 border border-gray-600/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 group-hover:border-gray-500/70"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              
              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2 mt-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Password strength: <span className={`font-medium ${passwordStrength >= 3 ? "text-green-400" : passwordStrength >= 2 ? "text-yellow-400" : "text-red-400"}`}>
                      {strengthLabels[passwordStrength - 1] || "Very Weak"}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Error message */}
            {errors.general && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                {errors.general}
              </div>
            )}


            {/* Register button */}
            <button
              type="submit"
              disabled={isLoading || !name || !email || !password || passwordStrength < 2}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transform hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-30 -z-10" />
            </button>
          </form>

          {/* Login link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-700/30">
            <span className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                 Sign in
                </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}