const TZ = "America/Los_Angeles";

export const formatDateRange = (startIso: string, endIso: string) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const month = (d: Date) => d.toLocaleDateString("en-US", { month: "long", timeZone: TZ });
  const day = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric", timeZone: TZ });
  const year = start.toLocaleDateString("en-US", { year: "numeric", timeZone: TZ });
  if (day(start) === day(end) && month(start) === month(end)) return `${month(start)} ${day(start)}, ${year}`;
  return month(start) === month(end)
    ? `${month(start)} ${day(start)}–${day(end)}, ${year}`
    : `${month(start)} ${day(start)} – ${month(end)} ${day(end)}, ${year}`;
};

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
