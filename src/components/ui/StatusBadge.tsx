import React from "react";
import { JobStatus } from "@/types";

interface StatusBadgeProps {
  status: JobStatus | string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const getBadgeConfig = (st: string) => {
    switch (st) {
      case "SELESAI":
        return {
          label: "Selesai",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dot: "bg-emerald-500",
          pulse: false,
        };
      case "DALAM_PENGERJAAN":
        return {
          label: "Dalam Pengerjaan",
          bg: "bg-amber-50 text-amber-800 border-amber-300",
          dot: "bg-amber-500",
          pulse: true,
        };
      case "DIJADWALKAN":
        return {
          label: "Dijadwalkan",
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          dot: "bg-blue-600",
          pulse: false,
        };
      case "PENDING":
        return {
          label: "Pending",
          bg: "bg-yellow-50 text-yellow-800 border-yellow-300",
          dot: "bg-yellow-500",
          pulse: true,
        };
      case "DIBATALKAN":
        return {
          label: "Dibatalkan",
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          pulse: false,
        };
      default:
        return {
          label: st,
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          pulse: false,
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs transition-all ${
        config.bg
      } ${size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"}`}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
};
