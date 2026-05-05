"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatDuration(ms) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function DuelRoomPage() {
  const params = useParams();
  const roomCodeValue = params?.roomCode;
  const roomCode = Array.isArray(roomCodeValue) ? roomCodeValue[0] : roomCodeValue;
  const router = useRouter();
  const { user, token } = useAuth();

  const [room, setRoom] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [remainingMs, setRemainingMs] = useState(0);
  const [joining, setJoining] = useState(false);
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState("");
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showSolvedAllDialog, setShowSolvedAllDialog] = useState(false);
  const [opponentNotice, setOpponentNotice] = useState("");
  const previousGuestId = useRef(null);
  const acknowledgedEndReasonRef = useRef("");

  const fetchRoom = useCallback(async ({ silent = false } = {}) => {
    if (!roomCode) return;

    try {
      if (!silent) {
        setLoading(true);
      }
      setError(""); // Always clear error before fetching

      const response = await fetch(`/api/duels/${roomCode}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load room");
      }

      setRoom(payload.room || null);
      setLeaderboard(Array.isArray(payload.leaderboard) ? payload.leaderboard : []);
      setWinner(payload.winner || null);
    } catch (loadError) {
      if (!silent) {
        setError(loadError.message || "Failed to load room");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [roomCode]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (!room || room.status === "ended") return undefined;

    const poller = window.setInterval(() => {
      fetchRoom({ silent: true });
    }, 6000);

    return () => window.clearInterval(poller);
  }, [fetchRoom, room]);

  useEffect(() => {
    if (!room) return;
    const guestId = room.guest?.id || null;
    const wasGuestId = previousGuestId.current;

    if (!wasGuestId && guestId && room.status === "waiting") {
      setOpponentNotice("Opponent joined. Ready to start the match.");
      window.setTimeout(() => {
        setOpponentNotice("");
      }, 5000);
    }

    if (wasGuestId && !guestId && room.status === "waiting") {
      setOpponentNotice("Opponent left the room.");
      window.setTimeout(() => {
        setOpponentNotice("");
      }, 5000);
    }

    previousGuestId.current = guestId;
  }, [room]);

  useEffect(() => {
    if (!room) return undefined;

    const updateCountdown = () => {
      const now = Date.now();
      const start = room.startedAt ? new Date(room.startedAt).getTime() : null;
      const end = room.endedAt ? new Date(room.endedAt).getTime() : null;

      if (room.status === "waiting") {
        setRemainingMs(start ? Math.max(0, start - now) : 0);
      } else if (room.status === "live") {
        setRemainingMs(end ? Math.max(0, end - now) : 0);
      } else {
        setRemainingMs(0);
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [room]);

  const userId = String(user?.id || user?._id || "");
  const isHost = userId && room?.host?.id === userId;
  const isGuest = userId && room?.guest?.id === userId;
  const hasOpponent = Boolean(room?.guest);
  const currentUserSolvedAll = useMemo(() => {
    if (!room || !userId) return false;
    const row = leaderboard.find((item) => String(item.userId) === userId);
    return Boolean(row && room.problemCount > 0 && row.solved >= room.problemCount);
  }, [leaderboard, room, userId]);

  const opponentSolvedAll =
    room?.status === "ended" &&
    room?.endReason === "all_solved" &&
    Boolean(room?.winnerUserId) &&
    room.winnerUserId !== userId &&
    !currentUserSolvedAll;

  useEffect(() => {
    if (opponentSolvedAll && acknowledgedEndReasonRef.current !== room?.roomCode) {
      acknowledgedEndReasonRef.current = room?.roomCode || "";
      setShowSolvedAllDialog(true);
    }
  }, [opponentSolvedAll, room?.roomCode]);

  const handleJoin = async () => {
    if (!token) {
      setJoinError("Login required to join.");
      return;
    }

    try {
      setJoining(true);
      setJoinError("");

      const response = await fetch(`/api/duels/${roomCode}/join`, {
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

      await fetchRoom();
    } catch (joinErr) {
      setJoinError(joinErr.message || "Failed to join room");
    } finally {
      setJoining(false);
    }
  };

  const handleStart = async () => {
    if (!token) return;
    try {
      setStarting(true);
      const response = await fetch(`/api/duels/${roomCode}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to start room");
      }

      await fetchRoom();
    } catch (startError) {
      setError(startError.message || "Failed to start room");
    } finally {
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    if (!roomCode) return;

    if (!token) {
      router.push("/duels");
      return;
    }

    try {
      setLeaving(true);
      setLeaveError("");

      const response = await fetch(`/api/duels/${roomCode}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to leave room");
      }

      router.push("/duels");
    } catch (leaveErr) {
      setLeaveError(leaveErr.message || "Failed to leave room");
    } finally {
      setLeaving(false);
    }
  };

  const initiateDelete = () => {
    if (!roomCode || !isHost) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!roomCode) return;

    if (!token) {
      router.push("/duels");
      return;
    }

    try {
      setConfirmingDelete(true);
      setDeleteError("");

      const response = await fetch(`/api/duels/${roomCode}/delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete room");
      }

      router.push("/duels");
    } catch (deleteErr) {
      setDeleteError(deleteErr.message || "Failed to delete room");
      setShowDeleteConfirm(false);
    } finally {
      setConfirmingDelete(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteError("");
  };

  const handleDelete = () => {
    initiateDelete();
  };

  const headerCountdown = useMemo(() => {
    if (!room) return "";
    if (room.status === "waiting") return "Waiting for start";
    if (room.status === "live") return `Ends in ${formatDuration(remainingMs)}`;
    return "Match ended";
  }, [room, remainingMs]);

  if (loading) {
    return <div className="neo-card p-6 text-sm">Loading room...</div>;
  }

  if (error) {
    return (
      <div className="neo-card bg-[#fff0ea] p-6 text-sm text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
        {error}
      </div>
    );
  }

  if (!room) {
    return <div className="neo-card p-6 text-sm">Room not found.</div>;
  }

  return (
    <section className="space-y-8">
      <header className="neo-card relative overflow-hidden px-6 py-8 md:px-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full border-2 border-black bg-[#0f92ff] opacity-60 dark:border-[#8aa0d0] dark:bg-[#243252]" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full border-2 border-black bg-[#f4b35f] opacity-45 dark:border-[#8aa0d0] dark:bg-[#3b2d1c]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="inline-flex rounded-full bg-[#44d07d] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-black dark:bg-[#203b2d] dark:text-[#bdf5d0]">
              {room.status}
            </div>
            <h1 className="mt-3 text-2xl font-black uppercase text-black dark:text-[#eef3ff]">
              {room.title}
            </h1>
            <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
              Room code: {room.roomCode}
            </p>
            <div className="mt-2 text-xs text-black/70 dark:text-[#d4deff]/80">
              Host: {room.host?.name || "Host"}
              {room.guest ? ` • Opponent: ${room.guest.name}` : " • Waiting for opponent"}
            </div>
            {opponentNotice && (
              <div className="mt-3 rounded-lg bg-[#eaf8ee] px-3 py-2 text-xs font-semibold text-[#1f4d30] dark:bg-[#193223] dark:text-[#c6ffd8]">
                {opponentNotice}
              </div>
            )}
            {leaveError && (
              <div className="mt-3 rounded-lg bg-[#fff0ea] px-3 py-2 text-xs text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
                {leaveError}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-black bg-white p-4 text-sm font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
              <div className="text-xs font-black uppercase text-black/60 dark:text-[#d4deff]/70">Countdown</div>
              <div className="mt-2 text-lg font-black">{headerCountdown}</div>
              <div className="mt-1 text-xs text-black/60 dark:text-[#d4deff]/70">Start {formatDate(room.startedAt)}</div>
              <div className="text-xs text-black/60 dark:text-[#d4deff]/70">End {formatDate(room.endedAt)}</div>
            </div>
            {isHost && room.status === "waiting" && (
              <div className="space-y-2">
                {deleteError && (
                  <div className="rounded-lg bg-[#fff0ea] px-3 py-2 text-xs text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
                    {deleteError}
                  </div>
                )}
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg border-2 border-black bg-[#f14a4a] px-4 py-2 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60 dark:border-[#7d8fc4]/35"
                  >
                    {deleting ? "Deleting..." : "Delete Room"}
                  </button>
                  <button
                    onClick={handleLeave}
                    disabled={leaving}
                    className="rounded-lg border-2 border-black bg-[#ff6b35] px-4 py-2 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60 dark:border-[#7d8fc4]/35"
                  >
                    {leaving ? "Leaving..." : "Leave Room"}
                  </button>
                </div>
              </div>
            )}
            {isGuest && (
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="rounded-lg border-2 border-black bg-[#ff6b35] px-4 py-2 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60 dark:border-[#7d8fc4]/35"
              >
                {leaving ? "Leaving..." : "Leave Room"}
              </button>
            )}
            {isHost && room.status !== "waiting" && (
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="rounded-lg border-2 border-black bg-[#ff6b35] px-4 py-2 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60 dark:border-[#7d8fc4]/35"
              >
                {leaving ? "Leaving..." : "Leave Room"}
              </button>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-black bg-white p-3 text-xs font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#d4deff]/70">Duration</div>
                <div className="mt-1 text-sm font-black">{room.durationMinutes} min</div>
              </div>
              <div className="rounded-2xl border-2 border-black bg-white p-3 text-xs font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#d4deff]/70">Problems</div>
                <div className="mt-1 text-sm font-black">{room.problemCount}</div>
              </div>
              <div className="rounded-2xl border-2 border-black bg-white p-3 text-xs font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#d4deff]/70">Total Points</div>
                <div className="mt-1 text-sm font-black">{room.totalPoints}</div>
              </div>
              <div className="rounded-2xl border-2 border-black bg-white p-3 text-xs font-semibold text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]">
                <div className="text-[10px] font-black uppercase text-black/60 dark:text-[#d4deff]/70">Access</div>
                <div className="mt-1 text-sm font-black">{room.isPrivate ? "Private" : "Open"}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {room.status === "waiting" && !isHost && !isGuest && (
        <div className="neo-card p-5">
          <h2 className="text-sm font-black uppercase">Join Room</h2>
          {room.isPrivate && (
            <input
              type="password"
              value={joinPassword}
              onChange={(event) => setJoinPassword(event.target.value)}
              placeholder="Room password"
              className="mt-3 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
          )}
          {joinError && (
            <div className="mt-3 rounded-lg bg-[#fff0ea] px-3 py-2 text-xs text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
              {joinError}
            </div>
          )}
          <button
            onClick={handleJoin}
            disabled={joining}
            className="mt-3 rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60 dark:bg-[#fef08a]"
          >
            {joining ? "Joining..." : "Join Room"}
          </button>
        </div>
      )}

      {room.status === "waiting" && isHost && (
        <div className="neo-card p-5">
          <h2 className="text-sm font-black uppercase">Host Controls</h2>
          {!hasOpponent ? (
            <p className="mt-2 text-sm text-black/70 dark:text-[#d4deff]/80">
              Waiting for opponent to join.
            </p>
          ) : (
            <button
              onClick={handleStart}
              disabled={starting}
              className="mt-3 rounded-lg bg-[#44d07d] px-4 py-2 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60"
            >
              {starting ? "Starting..." : "Start Match"}
            </button>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="neo-card overflow-hidden">
          <div className="border-b border-black/20 bg-white px-5 py-3 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
            <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Leaderboard</h2>
          </div>
          {leaderboard.length === 0 ? (
            <div className="p-6 text-sm text-black/70 dark:text-[#d4deff]/80">
              No results yet.
            </div>
          ) : (
            <div className="divide-y divide-black/10 dark:divide-[#7d8fc4]/30">
              {leaderboard.map((row) => (
                <div key={row.userId} className="grid gap-2 px-5 py-3 md:grid-cols-[80px_minmax(0,2fr)_100px_100px] md:items-center">
                  <div className="text-sm font-black text-black dark:text-[#eef3ff]">#{row.rank}</div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-black dark:text-[#eef3ff]">{row.name}</div>
                    <div className="text-xs text-black/70 dark:text-[#d4deff]/80">Solved {row.solved}</div>
                  </div>
                  <div className="text-sm font-bold text-black dark:text-[#eef3ff]">Score {row.score}</div>
                  <div className="text-sm font-bold text-black dark:text-[#eef3ff]">Penalty {row.penalty}m</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="neo-card p-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Problem List</h2>
          {room.problemsLocked ? (
            <div className="mt-3 rounded-lg border border-dashed border-black/20 bg-white px-3 py-2 text-xs text-black/70 dark:border-[#7d8fc4]/40 dark:bg-[#10182d] dark:text-[#d4deff]/80">
              Problems unlock when the host starts the match.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {(room.problems || []).map((problem, index) => (
                <div key={problem.problemSlug} className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-black dark:text-[#eef3ff]">
                        Q{index + 1}. {problem.title}
                      </div>
                      <div className="mt-1 text-xs text-black/70 dark:text-[#d4deff]/80">
                        {problem.problemSlug} • {problem.points} pts
                        {problem.difficulty ? ` • ${problem.difficulty}` : ""}
                        {problem.rating ? ` • ${problem.rating}` : ""}
                      </div>
                    </div>
                    <Link
                      href={`/problems/${problem.problemSlug}?room=${room.roomCode}`}
                      className="rounded-lg bg-[#0f92ff] px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {winner && (
        <div className="neo-card p-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">Winner</h2>
          <div className="mt-2 text-sm font-semibold text-black dark:text-[#eef3ff]">
            {winner.name} wins with {winner.solved} solves.
          </div>
        </div>
      )}

      {showSolvedAllDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="neo-card w-full max-w-md border-2 border-black bg-white p-6 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
            <div className="text-xs font-black uppercase tracking-wide text-black/60 dark:text-[#d4deff]/70">
              Contest Ended
            </div>
            <h2 className="mt-2 text-2xl font-black uppercase text-black dark:text-[#eef3ff]">
              Opponent solved all problems
            </h2>
            <p className="mt-3 text-sm font-semibold text-black/80 dark:text-[#d4deff]/90">
              The contest ended immediately because your opponent solved every problem.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowSolvedAllDialog(false)}
                className="rounded-lg border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="neo-card w-full max-w-md overflow-hidden border-2 border-black bg-white p-6 dark:border-[#7d8fc4]/35 dark:bg-[#10182d]">
            <h2 className="text-lg font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
              Delete Room
            </h2>
            <p className="mt-4 text-sm font-semibold text-black/80 dark:text-[#d4deff]/90">
              Are you sure you want to delete this room? This action cannot be undone and all associated data will be permanently removed.
            </p>
            {deleteError && (
              <div className="mt-4 rounded-lg bg-[#fff0ea] px-3 py-2 text-xs text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
                {deleteError}
              </div>
            )}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={cancelDelete}
                disabled={confirmingDelete}
                className="rounded-lg border-2 border-black bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60 dark:border-[#7d8fc4]/35 dark:bg-[#151525] dark:text-[#eef3ff]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={confirmingDelete}
                className="rounded-lg border-2 border-black bg-[#f14a4a] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60 dark:border-[#7d8fc4]/35"
              >
                {confirmingDelete ? "Deleting..." : "Delete Room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
