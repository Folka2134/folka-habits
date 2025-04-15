import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Subject } from "./subjects";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function GetTotalMinutes(subject: Subject) {
  let totalMinutes = 0;
  subject.sessions.forEach((session) => {
    totalMinutes += session.inputMinutes + session.outputMinutes;
  });
  return totalMinutes;
}

export function formatDate(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
