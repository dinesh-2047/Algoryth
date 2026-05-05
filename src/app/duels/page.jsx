"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const MAX_PROBLEMS = 8;
const MAX_DURATION_MINUTES = 180;

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function DuelsPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");

  const [problems, setProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] = useState(true);
  const [problemSearch, setProblemSearch] = useState("");

  const [roomForm, setRoomForm] = useState({
    title: "",
    durationMinutes: 60,
    password: "",
  });
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const [joinCode, setJoinCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setRoomsLoading(true);
        setRoomsError("");

        const response = await fetch("/api/duels", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load rooms");
        }

        setRooms(Array.isArray(payload.rooms) ? payload.rooms : []);
      } catch (loadError) {
        setRoomsError(loadError.message || "Failed to load rooms");
      } finally {
        setRoomsLoading(false);
      }
    };

    loadRooms();
  }, []);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        setProblemsLoading(true);
        const response = await fetch("/api/problems?sort=rating", { cache: "no-store" });
        const payload = await response.json();
        if (response.ok) {
          const items = Array.isArray(payload.items) ? payload.items : [];
          setProblems(items.filter((problem) => problem.isPublic === true));
        }
      } catch (loadError) {
        console.error("Failed to load problems", loadError);
      } finally {
        setProblemsLoading(false);
      }
    };

    loadProblems();
  }, []);

  const filteredProblems = useMemo(() => {
    const search = problemSearch.trim().toLowerCase();
    const selectedSet = new Set(selectedProblems.map((item) => item.problemSlug));

    return problems.filter((problem) => {
      if (selectedSet.has(problem.slug)) return false;
      if (!search) return true;
      const haystack = `${problem.title} ${problem.slug}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [problems, problemSearch, selectedProblems]);

  const filteredRooms = useMemo(() => {
    const search = joinCode.trim().toLowerCase();
    if (!search) return rooms;
    return rooms.filter((room) =>
      String(room.roomCode || "").toLowerCase().includes(search)
    );
  }, [rooms, joinCode]);

  const addProblem = (problem) => {
    if (selectedProblems.length >= MAX_PROBLEMS) {
      setError(`Only ${MAX_PROBLEMS} problems are allowed in a room.`);
      return;
    }

    setSelectedProblems((prev) => [
      ...prev,
      {
        problemSlug: problem.slug,
        title: problem.title,
        difficulty: problem.difficulty,
        rating: problem.rating,
        points: 100,
      },
    ]);
  };

  const updateProblemPoints = (slug, value) => {
    setSelectedProblems((prev) =>
      prev.map((item) =>
        item.problemSlug === slug
          ? { ...item, points: Math.max(1, Number(value || 1)) }
          : item
      )
    );
  };

  const removeProblem = (slug) => {
    setSelectedProblems((prev) => prev.filter((item) => item.problemSlug !== slug));
  };

  const handleCreateRoom = async () => {
    if (!token) {
      router.push(`/auth?redirect=${encodeURIComponent("/duels")}`);
      return;
    }

    if (selectedProblems.length === 0) {
      setError("Select at least one problem.");
      return;
    }

    if (Number(roomForm.durationMinutes || 0) > MAX_DURATION_MINUTES) {
      setError("Duration cannot exceed 180 minutes.");
      return;
    }

    try {
      setStatus("Creating room...");
      setError("");

      const response = await fetch("/api/duels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: roomForm.title,
          durationMinutes: Number(roomForm.durationMinutes || 60),
          password: roomForm.password,
          problems: selectedProblems.map((item) => ({
            problemSlug: item.problemSlug,
            points: Number(item.points || 1),
          })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create room");
      }

      setStatus("Room created.");
      setRoomForm({ title: "", durationMinutes: 60, password: "" });
      setSelectedProblems([]);
      setRooms((prev) => [payload.room, ...prev]);
      if (payload.room?.roomCode) {
        router.push(`/duels/${payload.room.roomCode}`);
      }
    } catch (createError) {
      setStatus("");
      setError(createError.message || "Failed to create room");
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode) {
      setJoinError("Room code is required.");
      return;
    }

    if (!token) {
      router.push(`/auth?redirect=${encodeURIComponent("/duels")}`);
      return;
    }

    try {
      setJoinError("");
      const response = await fetch(`/api/duels/${joinCode}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: joinPassword }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to join room");
      }

      router.push(`/duels/${joinCode}`);
    } catch (joinErr) {
      setJoinError(joinErr.message || "Failed to join room");
    }
  };

  return (
    <section className="space-y-8">
      <header className="neo-card relative overflow-hidden px-6 py-8 md:px-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border-2 border-black bg-[#0f92ff] opacity-60 dark:border-[#8aa0d0] dark:bg-[#243252]" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full border-2 border-black bg-[#f4b35f] opacity-50 dark:border-[#8aa0d0] dark:bg-[#3b2d1c]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#111827] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white dark:bg-[#0b1222]">
              Algoryth 1v1 Arena
            </div>
            <div className="mt-4 flex items-center justify-between">
              <h1 className="text-3xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
                1v1 Rooms
              </h1>
              <Link
                href="/duels/history"
                className="rounded-lg border-2 border-black bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-black dark:border-[#7d8fc4]/35 dark:bg-[#10182d] dark:text-[#eef3ff]"
              >
                View History
              </Link>
            </div>
            <p className="mt-2 max-w-xl text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
              Create a room, pick public problems, and race to solve before your opponent.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-black bg-white p-4 text-sm font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
            <div className="text-xs font-black uppercase text-black/60 dark:text-[#d4deff]/70">
              Quick Join
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="Room code"
                className="rounded-lg bg-[#fff9d0] px-3 py-2 text-sm text-black dark:bg-[#202037] dark:text-[#fff9f0]"
              />
              <input
                value={joinPassword}
                onChange={(event) => setJoinPassword(event.target.value)}
                placeholder="Password (optional)"
                type="password"
                className="rounded-lg bg-[#fff9d0] px-3 py-2 text-sm text-black dark:bg-[#202037] dark:text-[#fff9f0]"
              />
            </div>
            {joinError && (
              <div className="mt-2 rounded-lg bg-[#fff0ea] px-3 py-2 text-xs text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
                {joinError}
              </div>
            )}
            <button
              onClick={handleJoinRoom}
              className="mt-3 rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
            >
              Join Room
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="neo-card p-5 space-y-3">
          <h2 className="text-sm font-black uppercase">Create 1v1 Room</h2>
          <input
            value={roomForm.title}
            onChange={(event) => setRoomForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Room title (optional)"
            className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="number"
              min={10}
              max={MAX_DURATION_MINUTES}
              value={roomForm.durationMinutes}
              onChange={(event) =>
                setRoomForm((prev) => ({
                  ...prev,
                  durationMinutes: Number(event.target.value || 60),
                }))
              }
              className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <input
              type="password"
              value={roomForm.password}
              onChange={(event) => setRoomForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Password (optional)"
              className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase">Selected Problems</div>
              <div className="text-xs font-semibold text-black/70 dark:text-[#d4deff]/80">
                {selectedProblems.length}/{MAX_PROBLEMS}
              </div>
            </div>
            {selectedProblems.length === 0 ? (
              <div className="mt-3 text-xs text-black/60 dark:text-[#d4deff]/70">
                Add problems from the list below.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {selectedProblems.map((problem) => (
                  <div key={problem.problemSlug} className="rounded-lg border border-black/10 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-black dark:text-[#eef3ff]">
                          {problem.title}
                        </div>
                        <div className="text-xs text-black/70 dark:text-[#d4deff]/80">
                          {problem.problemSlug} • {problem.difficulty} • {problem.rating}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={Number(problem.points || 1)}
                          onChange={(event) => updateProblemPoints(problem.problemSlug, event.target.value)}
                          className="w-20 rounded-lg bg-[#fff9d0] px-2 py-1 text-xs font-bold text-black dark:bg-[#202037] dark:text-[#fff9f0]"
                        />
                        <button
                          onClick={() => removeProblem(problem.problemSlug)}
                          className="rounded-lg bg-[#ff6b35] px-2 py-1 text-[11px] font-black uppercase text-black"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-black uppercase">Public Problem Library</div>
              <input
                value={problemSearch}
                onChange={(event) => setProblemSearch(event.target.value)}
                placeholder="Search problems"
                className="w-full rounded-lg bg-white px-3 py-1.5 text-xs dark:bg-[#10182d] sm:w-48"
              />
            </div>
            <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
              {problemsLoading ? (
                <div className="text-xs text-black/60 dark:text-[#d4deff]/70">Loading problems...</div>
              ) : filteredProblems.length === 0 ? (
                <div className="text-xs text-black/60 dark:text-[#d4deff]/70">No matches available.</div>
              ) : (
                filteredProblems.map((problem) => (
                  <div key={problem.slug} className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-2 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
                    <div>
                      <div className="text-xs font-black text-black dark:text-[#eef3ff]">{problem.title}</div>
                      <div className="text-[11px] text-black/70 dark:text-[#d4deff]/80">
                        {problem.slug} • {problem.difficulty} • {problem.rating}
                      </div>
                    </div>
                    <button
                      onClick={() => addProblem(problem)}
                      className="rounded-lg bg-[#44d07d] px-2 py-1 text-[11px] font-black uppercase text-black"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {(status || error) && (
            <div className="space-y-2">
              {status && (
                <div className="rounded-lg bg-[#eaf8ee] px-3 py-2 text-xs text-[#1f4d30] dark:bg-[#193223] dark:text-[#c6ffd8]">
                  {status}
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-[#fff0ea] px-3 py-2 text-xs text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
                  {error}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCreateRoom}
            className="rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
          >
            Create Room
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
            Available Rooms
          </h2>
          {roomsLoading && <div className="neo-card p-4 text-sm">Loading rooms...</div>}
          {roomsError && (
            <div className="neo-card bg-[#fff0ea] p-4 text-sm text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
              {roomsError}
            </div>
          )}
          {!roomsLoading && !roomsError && (
            <div className="space-y-3">
              {filteredRooms.length === 0 ? (
                <div className="neo-card p-4 text-sm text-black/70 dark:text-[#d4deff]/80">
                  No rooms yet.
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <Link
                    key={room.roomCode}
                    href={`/duels/${room.roomCode}`}
                    className="block w-full neo-card p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-black uppercase text-black/60 dark:text-[#d4deff]/70">
                          Room {room.roomCode}
                        </div>
                        <div className="mt-1 text-base font-black text-black dark:text-[#eef3ff]">
                          {room.title || "Untitled Room"}
                        </div>
                        <div className="mt-1 text-xs text-black/70 dark:text-[#d4deff]/80">
                          {room.problemCount} problems • {room.durationMinutes} min
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase">
                        <span className="rounded-full border border-black/10 bg-white px-2 py-1 dark:border-[#7d8fc4]/40 dark:bg-[#10182d]">
                          {room.status}
                        </span>
                        {room.isPrivate && (
                          <span className="rounded-full border border-black/10 bg-white px-2 py-1 dark:border-[#7d8fc4]/40 dark:bg-[#10182d]">
                            Private
                          </span>
                        )}
                        <span className="rounded-full bg-[#0f92ff] px-3 py-1 text-black dark:bg-[#fef08a]">
                          Open
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-black/60 dark:text-[#d4deff]/70">
                      Created {formatDate(room.createdAt)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
