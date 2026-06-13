import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from "date-fns";
import type { CareType, TaskStatus } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date string to a readable format */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy h:mm a");
}

/** Format a date to short form (for tables) */
export function formatDateShort(date: string | Date): string {
  return format(new Date(date), "MMM d, yyyy");
}

/** Format time only */
export function formatTime(date: string | Date): string {
  return format(new Date(date), "h:mm a");
}

/** Relative time */
export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Care type display color classes */
export function careTypeColor(type: CareType): string {
  const map: Record<CareType, string> = {
    watering: "bg-care-watering text-white",
    fertilizing: "bg-care-fertilizing text-white",
    pruning: "bg-care-pruning text-white",
    pest_control: "bg-care-pest-control text-white",
    repotting: "bg-care-repotting text-white",
  };
  return map[type] ?? "bg-muted text-muted-foreground";
}

/** Care type border color for task cards */
export function careTypeBorder(type: CareType): string {
  const map: Record<CareType, string> = {
    watering: "border-l-care-watering",
    fertilizing: "border-l-care-fertilizing",
    pruning: "border-l-care-pruning",
    pest_control: "border-l-care-pest-control",
    repotting: "border-l-care-repotting",
  };
  return map[type] ?? "border-l-muted";
}

/** Human-readable care type label */
export function careTypeLabel(type: CareType): string {
  const map: Record<CareType, string> = {
    watering: "Watering",
    fertilizing: "Fertilizing",
    pruning: "Pruning",
    pest_control: "Pest Control",
    repotting: "Repotting",
  };
  return map[type] ?? type;
}

/** Task status badge color classes */
export function statusColor(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    pending: "bg-status-pending text-white",
    completed: "bg-status-completed text-white",
    missed: "bg-status-missed text-white",
    skipped: "bg-muted text-muted-foreground",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
