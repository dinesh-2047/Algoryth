"use client";

import { Search } from "lucide-react";

export default function EmptyState({
  icon: Icon = Search,
  title = "No problems found",
  description = "Try adjusting your search or filter criteria.",
  actionLabel = "Reset Filters",
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl bg-[#f7f0e0] dark:bg-[#292331]">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#e0d5c2] dark:bg-[#3c3347]">
        <Icon className="h-12 w-12 text-[#8a7a67] dark:text-[#b5a59c]" />
      </div>

      <h3 className="mb-3 text-xl font-semibold text-[#2b2116] dark:text-[#f6ede0]">
        {title}
      </h3>

      {description && (
        <p className="mb-6 max-w-md text-sm text-[#5d5245] dark:text-[#d7ccbe]">
          {description}
        </p>
      )}

      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-lg bg-[#d69a44] px-6 py-3 text-sm font-semibold text-[#2b1a09] transition-all hover:bg-[#c99a4c] dark:bg-[#f2c66f] dark:text-[#231406] dark:hover:bg-[#f2d580]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
