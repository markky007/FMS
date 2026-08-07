/**
 * Date Formatting Utility Functions
 */

export function formatDateThai(
  dateStr?: string | Date | null,
  format: "short" | "medium" | "full" = "medium",
): string {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "-";

  if (format === "short") {
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  }

  if (format === "full") {
    return date.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeThai(dateStr?: string | Date | null): string {
  if (!dateStr) return "-";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "-";

  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0] || "";
}

export function getFirstDayOfMonthString(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0] || "";
}
