import type { Clock } from '../domain/clock';
import { madridTimeOf } from '../domain/madrid-time.util';

/**
 * Solo para probar en desarrollo: `?fecha=2026-12-05` o `?fecha=2026-12-05T23:59` hace que la app crea
 * que es ese momento (hora de Madrid) y el reloj sigue corriendo desde ahí. En la versión publicada no se usa.
 */
export function createDateOverrideClock(search: string, fallback: Clock): Clock {
  const value = new URLSearchParams(search).get('fecha');
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/);
  if (!match) return fallback;

  const [, year, month, day, hour = '0', minute = '0'] = match;
  const fakeStart = madridTimeOf(
    { year: Number(year), month: Number(month), day: Number(day) },
    Number(hour),
    Number(minute),
  ).getTime();
  const realStart = Date.now();
  return () => new Date(fakeStart + (Date.now() - realStart));
}
