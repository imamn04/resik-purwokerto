import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number to Rupiah (e.g. Rp 150.000)
export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format Indonesian Date (e.g. 01 November 2026)
export function formatDateID(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateString);
  }
}

// Format WhatsApp Phone Number to Standard 628...
export function sanitizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

// Generate WhatsApp Direct Message Link
export function getWhatsAppLink(phone: string, message: string = ""): string {
  const sanitized = sanitizePhoneNumber(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${sanitized}?text=${encoded}`;
}

// Job Status Configuration with Resik Purwokerto Theme
export const JOB_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  PENDING: {
    label: "Pending (Menunggu)",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  DIJADWALKAN: {
    label: "Dijadwalkan",
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  DALAM_PENGERJAAN: {
    label: "Dalam Pengerjaan",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-600",
  },
  SELESAI: {
    label: "Selesai",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  DIBATALKAN: {
    label: "Dibatalkan",
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

