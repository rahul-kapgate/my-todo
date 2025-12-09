// frontend/lib/date.ts

// 1. Normalize weird ISO strings like "2025-12-09T10:57:27.802000"
const normalizeIso = (value: string): string => {
    const [datePart, timePart] = value.split("T");
    if (!timePart) return value;
  
    // Separate off any trailing 'Z'
    const hasZ = timePart.endsWith("Z");
    const rawTime = hasZ ? timePart.slice(0, -1) : timePart;
  
    // Split fractional seconds
    const [hms, frac] = rawTime.split(".");
    if (!frac) {
      // no fractional part, just add Z if missing
      return `${datePart}T${hms}${hasZ ? "Z" : "Z"}`;
    }
  
    // Take at most 3 digits for milliseconds
    const milli = frac.slice(0, 3).padEnd(3, "0"); // "802000" -> "802"
  
    return `${datePart}T${hms}.${milli}Z`;
  };
  
  /**
   * Format an ISO datetime string into Indian time (IST, Asia/Kolkata).
   */
  export const formatToIST = (iso?: string | null): string => {
    if (!iso) return "-";
  
    const normalized = normalizeIso(iso);
    const d = new Date(normalized);
  
    if (Number.isNaN(d.getTime())) return "-";
  
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  