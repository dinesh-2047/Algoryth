"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function UserMenu() {
    const { user, logout, loading } = useAuth();

    if (loading) return <div className="h-9 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />;

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <span className="hidden text-sm font-medium text-[#2b1a09] sm:inline-block dark:text-[#f6ede0]">
                    {user.email}
                </span>
                <button
                    onClick={logout}
                    className="text-sm font-medium text-[#d69a44] hover:text-[#c4852c] dark:text-[#f2c66f]"
                >
                    Sign out
                </button>
                <div className="h-9 w-9 overflow-hidden rounded-full border border-[#deceb7] bg-[#fdf7ed] dark:border-[#40364f] dark:bg-[#221d2b]">
                    {/* Placeholder Avatar */}
                    <div className="flex h-full w-full items-center justify-center bg-[#d69a44] text-white">
                        {user.email?.[0].toUpperCase()}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-full bg-[#d69a44] px-4 text-sm font-medium text-[#2b1a09] hover:bg-[#c4852c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#e4b857]"
        >
            Sign in
        </Link>
    );
}
