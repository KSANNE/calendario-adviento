import { describe, expect, it } from 'vitest';
import type { AdventSeason } from './advent-season.entity';
import { buildAdventCalendar } from './advent-calendar.service';

const season: AdventSeason = { year: 2026, totalDays: 24, welcome: { title: 'Hola', message: '…' } };

describe('buildAdventCalendar', () => {
  it('antes del 1 de diciembre todas las puertas están cerradas y la cuenta atrás apunta al día 1', () => {
    const calendar = buildAdventCalendar(season, new Date('2026-11-19T12:00:00Z'), new Set());

    expect(calendar.phase).toBe('waiting');
    expect(calendar.currentDay).toBe(0);
    expect(calendar.doors.every((door) => door.state === 'locked')).toBe(true);
    expect(calendar.nextUnlockAt?.toISOString()).toBe('2026-11-30T23:00:00.000Z');
    expect(calendar.doors[0]!.daysLeft).toBe(12);
  });

  it('el día 5 se pueden abrir las cinco primeras y la de hoy queda marcada', () => {
    const calendar = buildAdventCalendar(season, new Date('2026-12-05T09:00:00Z'), new Set([1, 2, 4]));

    expect(calendar.phase).toBe('advent');
    expect(calendar.doors.slice(0, 6).map((door) => door.state)).toEqual([
      'opened',
      'opened',
      'available',
      'opened',
      'available',
      'locked',
    ]);
    expect(calendar.doors.filter((door) => door.isToday).map((door) => door.day)).toEqual([5]);
    expect(calendar.doors[5]!.daysLeft).toBe(1);
    expect(calendar.nextUnlockAt?.toISOString()).toBe('2026-12-05T23:00:00.000Z');
  });

  it('las puertas cambian a medianoche de Madrid, no a medianoche UTC', () => {
    const calendar = buildAdventCalendar(season, new Date('2026-11-30T23:00:00Z'), new Set());

    expect(calendar.phase).toBe('advent');
    expect(calendar.currentDay).toBe(1);
  });

  it('el último día no hay siguiente puerta y después todo queda abierto', () => {
    const lastDay = buildAdventCalendar(season, new Date('2026-12-24T20:00:00Z'), new Set());
    expect(lastDay.currentDay).toBe(24);
    expect(lastDay.nextUnlockAt).toBeNull();

    const after = buildAdventCalendar(season, new Date('2027-01-03T10:00:00Z'), new Set());
    expect(after.phase).toBe('finished');
    expect(after.doors.every((door) => door.state !== 'locked' && !door.isToday)).toBe(true);
  });
});
