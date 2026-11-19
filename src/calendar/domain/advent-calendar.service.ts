import { calendarDateOf, daysBetween, madridTimeOf } from '../../shared/domain/madrid-time.util';
import type { AdventSeason } from './advent-season.entity';
import type { Door } from './door.entity';

/**
 * - `waiting`: aún no es 1 de diciembre (cuenta atrás grande).
 * - `advent`: del 1 al último día; cada día se abre una puerta.
 * - `finished`: ya pasaron todos los días; todas las puertas se pueden ver.
 */
export type AdventPhase = 'waiting' | 'advent' | 'finished';

export interface AdventCalendar {
  now: Date;
  phase: AdventPhase;
  /** Último día que ya se puede abrir (0 mientras se espera). */
  currentDay: number;
  doors: Door[];
  startsAt: Date;
  /** Cuándo se desbloquea la siguiente puerta (null si ya no quedan). */
  nextUnlockAt: Date | null;
}

const DECEMBER = 12;

export function buildAdventCalendar(
  season: AdventSeason,
  now: Date,
  openedDays: ReadonlySet<number>,
): AdventCalendar {
  const dayOfDecember = (day: number) => ({ year: season.year, month: DECEMBER, day });
  const startsAt = madridTimeOf(dayOfDecember(1));
  const endsAt = madridTimeOf(dayOfDecember(season.totalDays + 1));
  const today = calendarDateOf(now);

  const phase: AdventPhase = now < startsAt ? 'waiting' : now >= endsAt ? 'finished' : 'advent';
  const currentDay = phase === 'waiting' ? 0 : phase === 'finished' ? season.totalDays : today.day;

  const doors: Door[] = Array.from({ length: season.totalDays }, (_, index) => {
    const day = index + 1;
    const unlocked = day <= currentDay;
    return {
      day,
      state: !unlocked ? 'locked' : openedDays.has(day) ? 'opened' : 'available',
      isToday: phase === 'advent' && day === currentDay,
      daysLeft: unlocked ? 0 : Math.max(1, daysBetween(today, dayOfDecember(day))),
    };
  });

  const nextUnlockAt =
    phase === 'waiting'
      ? startsAt
      : phase === 'advent' && currentDay < season.totalDays
        ? madridTimeOf(dayOfDecember(currentDay + 1))
        : null;

  return { now, phase, currentDay, doors, startsAt, nextUnlockAt };
}
