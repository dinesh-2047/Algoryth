"use client";

import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user, logout, loading } = useAuth();

  return (
    <section className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-[#e0d5c2] dark:border-[#3c3347]">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      {loading ? (
        <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#e0d5c2] dark:border-[#3c3347] p-4">
            <h2 className="text-sm font-semibold text-[#5d5245] dark:text-[#d7ccbe] mb-3">Profile</h2>
            {user ? (
              <div className="space-y-2 text-sm">
                <div><span className="text-[#8a7a67] dark:text-[#b5a59c]">Name:</span> <span className="font-medium">{user.name || "—"}</span></div>
                <div><span className="text-[#8a7a67] dark:text-[#b5a59c]">Email:</span> <span className="font-medium">{user.email || "—"}</span></div>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex h-9 items-center justify-center rounded-full bg-[#d69a44] px-4 text-sm font-medium text-[#2b1a09] hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#5d5245] dark:text-[#d7ccbe]">You are not signed in. Use the Sign in button in the header.</p>
            )}
          </div>

          <div className="rounded-xl border border-[#e0d5c2] dark:border-[#3c3347] p-4">
            <h2 className="text-sm font-semibold text-[#5d5245] dark:text-[#d7ccbe] mb-3">Preferences</h2>
            <p className="text-sm text-[#5d5245] dark:text-[#d7ccbe]">Theme can be toggled from the header. More preferences coming soon.</p>
          </div>
        </div>
      )}
    </section>
  );
}
