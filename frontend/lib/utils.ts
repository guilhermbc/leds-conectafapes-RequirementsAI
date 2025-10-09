import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number)
  // Month is 0-indexed in JavaScript Date object, so subtract 1
  const date = new Date(year, month - 1, day)
  const dayFormatted = String(date.getDate()).padStart(2, "0")
  const monthFormatted = String(date.getMonth() + 1).padStart(2, "0") // Month is 0-indexed
  const yearFormatted = String(date.getFullYear()).slice(-2) // Get last two digits of year
  return `${dayFormatted}/${monthFormatted}/${yearFormatted}`
}
