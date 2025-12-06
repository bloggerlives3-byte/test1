"use client";

import { useState } from "react";

const navItems = [
  { label: "Upload", href: "#upload" },
  { label: "Feed", href: "#feed" },
  { label: "Admin", href: "#admin" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex flex-col gap-4 rounded-3xl bg-white/80 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2rem] text-slate-500">MVP v1.0</p>
          <h1 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
            PicVault — private image hosting without the friction
          </h1>
          <p className="mt-2 max-w-3xl text-base text-slate-600 sm:text-lg">
            Built for quick sharing, auto-expiring links, and a zero-tracking experience.
          </p>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Toggle menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-slate-900" />
            <span className="block h-0.5 w-6 bg-slate-900" />
            <span className="block h-0.5 w-6 bg-slate-900" />
          </div>
        </button>
      </div>
      <div className="flex flex-col gap-3 text-sm text-slate-600 lg:flex-row lg:items-center lg:gap-4">
        <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 font-medium text-emerald-700 shadow-inner lg:flex">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Live privacy mode
        </div>
        <div className="hidden rounded-full bg-slate-100 px-3 py-2 font-medium text-slate-700 shadow-inner lg:block">
          Supabase storage + Next.js
        </div>
        <nav
          className={`overflow-hidden transition-all lg:overflow-visible lg:rounded-full lg:border lg:border-slate-200 lg:bg-white lg:px-2 lg:py-1 ${
            open ? "max-h-48 rounded-2xl border border-slate-200 bg-white px-3 py-2" : "max-h-0 lg:max-h-none"
          }`}
        >
          <ul className="flex flex-col gap-2 text-sm font-semibold text-slate-800 lg:flex-row lg:items-center lg:gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  className="block rounded-full px-3 py-2 transition hover:bg-emerald-50 hover:text-emerald-700"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
