"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";

export function AuthPanel() {
  const { userEmail, loading, signUp, signIn, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const headline = useMemo(
    () => (mode === "signin" ? "Sign in to upload" : "Create an account"),
    [mode],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const action = mode === "signin" ? signIn : signUp;
    const { error } = await action(email.trim(), password);
    if (error) {
      setMessage(error);
    } else {
      setMessage(mode === "signin" ? "Signed in" : "Account created. You can upload now.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <p className="text-sm text-slate-600">Loading auth…</p>
      </div>
    );
  }

  if (userEmail) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Account</p>
        <h3 className="text-xl font-semibold text-slate-900">Signed in</h3>
        <p className="text-sm text-slate-600">{userEmail}</p>
        <button
          className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-0.5 hover:shadow-lg"
          type="button"
          onClick={() => signOut()}
        >
          Sign out
        </button>
        <p className="mt-3 text-xs text-slate-500">Uploads require an active session.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">Account</p>
          <h3 className="text-xl font-semibold text-slate-900">{headline}</h3>
          <p className="text-sm text-slate-600">Use email + password for now.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-xs font-semibold text-slate-700">
          <button
            className={`rounded-full px-2 py-1 ${mode === "signin" ? "bg-white shadow" : ""}`}
            type="button"
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            className={`rounded-full px-2 py-1 ${mode === "signup" ? "bg-white shadow" : ""}`}
            type="button"
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>
      </div>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-500 focus:outline-none"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-emerald-500 focus:outline-none"
            placeholder="At least 6 characters"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
        {message ? <p className="text-sm text-amber-700">{message}</p> : null}
      </form>
    </div>
  );
}
