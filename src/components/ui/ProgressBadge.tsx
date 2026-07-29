"use client";

interface ProgressBadgeProps {
  completed: boolean;
}

export default function ProgressBadge({ completed }: ProgressBadgeProps) {
  if (!completed) return null;

  return (
    <div className="absolute top-3 right-3 z-20 w-6 h-6 bg-primary flex items-center justify-center">
      <span className="material-symbols-outlined text-on-primary text-[14px]">
        check
      </span>
    </div>
  );
}
