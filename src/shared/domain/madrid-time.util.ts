// El calendario sigue la hora de España aunque el móvil esté en otra zona horaria.
export const CALENDAR_TIME_ZONE = 'Europe/Madrid';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Un día del calendario (sin hora). `month` va de 1 a 12. */
export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: CALENDAR_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
});

function wallClockOf(instant: Date) {
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map((part) => [part.type, Number(part.value)]),
  ) as Record<string, number>;
  return {
    year: parts.year ?? 0,
    month: parts.month ?? 0,
    day: parts.day ?? 0,
    hour: parts.hour ?? 0,
    minute: parts.minute ?? 0,
    second: parts.second ?? 0,
  };
}

/** Diferencia (en ms) entre la hora de Madrid y la hora UTC en ese instante: +1 h en invierno, +2 h en verano. */
function madridOffsetMs(instant: Date): number {
  const wall = wallClockOf(instant);
  const wallAsUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, wall.second);
  return wallAsUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Qué día es en Madrid en ese instante. */
export function calendarDateOf(instant: Date): CalendarDate {
  const { year, month, day } = wallClockOf(instant);
  return { year, month, day };
}

/** Instante en que empieza ese día (00:00) en Madrid, o esa hora del día si se indica. */
export function madridTimeOf(date: CalendarDate, hour = 0, minute = 0): Date {
  const guess = Date.UTC(date.year, date.month - 1, date.day, hour, minute);
  // Dos pasadas por si el cambio de hora cae justo entre la suposición y el resultado.
  let instant = guess - madridOffsetMs(new Date(guess));
  instant = guess - madridOffsetMs(new Date(instant));
  return new Date(instant);
}

/** Días de calendario que faltan de `from` a `to` (negativo si `to` ya pasó). */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return Math.round(
    (Date.UTC(to.year, to.month - 1, to.day) - Date.UTC(from.year, from.month - 1, from.day)) / DAY_MS,
  );
}
