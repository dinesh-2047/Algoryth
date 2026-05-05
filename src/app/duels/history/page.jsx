"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function DuelHistoryPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/duels/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Failed to fetch history");
        }

        setHistory(Array.isArray(payload.history) ? payload.history : []);
      } catch (err) {
        setError(err.message || "Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token, router]);

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleTimeString();
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="neo-card p-6 text-sm">Loading history...</div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase text-black dark:text-[#eef3ff]">
            Duel History
          </h1>
          <p className="mt-2 text-sm text-black/75 dark:text-[#d4deff]/80">
            View all your completed and canceled duel matches
          </p>
        </div>
        <Link
          href="/duels"
          className="rounded-lg border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#eef3ff]"
        >
          Back to Duels
        </Link>
      </header>

      {error && (
        <div className="neo-card bg-[#fff0ea] p-4 text-sm text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <p className="text-sm text-black/70 dark:text-[#d4deff]/80">
            No duel matches in your history yet.
          </p>
          <Link
            href="/duels"
            className="mt-4 inline-block rounded-lg border-2 border-black bg-[#44d07d] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:border-[#7d8fc4]/35"
          >
            Create or Join a Room
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((room) => (
            <Link
              key={room._id}
              href={`/duels/${room.roomCode}`}
              className="neo-card block p-5 transition-all hover:shadow-lg dark:hover:shadow-[0_4px_20px_rgba(68,208,125,0.1)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black uppercase text-black dark:text-[#eef3ff]">
                      {room.title}
                    </h2>
                    <div className={`inline-flex rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                      room.status === "ended"
                        ? "bg-[#44d07d] text-black dark:bg-[#203b2d] dark:text-[#bdf5d0]"
                        : "bg-[#ffb347] text-black dark:bg-[#3b2d1f] dark:text-[#ffd9a8]"
                    }`}>
                      {room.status === "ended" ? "Completed" : "Canceled"}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-black/70 dark:text-[#d4deff]/80">
                    Room Code: {room.roomCode}
                  </p>
                  <div className="mt-2 grid gap-4 text-xs sm:grid-cols-4">
                    <div>
                      <div className="font-black text-black/60 dark:text-[#d4deff]/70">
                        Date
                      </div>
                      <div className="mt-1 font-semibold text-black dark:text-[#eef3ff]">
                        {formatDate(room.endedAt)}
                      </div>
                    </div>
                    <div>
                      <div className="font-black text-black/60 dark:text-[#d4deff]/70">
                        Time
                      </div>
                      <div className="mt-1 font-semibold text-black dark:text-[#eef3ff]">
                        {formatTime(room.endedAt)}
                      </div>
                    </div>
                    <div>
                      <div className="font-black text-black/60 dark:text-[#d4deff]/70">
                        Your Role
                      </div>
                      <div className="mt-1 font-semibold text-black dark:text-[#eef3ff]">
                        {room.isHost ? "Host" : "Guest"}
                      </div>
                    </div>
                    <div>
                      <div className="font-black text-black/60 dark:text-[#d4deff]/70">
                        Duration
                      </div>
                      <div className="mt-1 font-semibold text-black dark:text-[#eef3ff]">
                        {room.durationMinutes} min
                      </div>
                    </div>
                  </div>
                </div>
                <button className="shrink-0 rounded-lg border-2 border-black bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:border-[#7d8fc4]/35 dark:bg-[#fef08a]">
                  View Details
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
