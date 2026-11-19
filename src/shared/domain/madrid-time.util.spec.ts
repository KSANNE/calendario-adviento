import { describe, expect, it } from 'vitest';
import { calendarDateOf, daysBetween, madridTimeOf } from './madrid-time.util';

describe('madrid-time.util', () => {
  it('el 1 de diciembre empieza a las 23:00 UTC del día anterior (horario de invierno)', () => {
    expect(madridTimeOf({ year: 2026, month: 12, day: 1 }).toISOString()).toBe('2026-11-30T23:00:00.000Z');
  });

  it('en verano la diferencia con UTC es de dos horas', () => {
    expect(madridTimeOf({ year: 2026, month: 7, day: 15 }, 10).toISOString()).toBe(
      '2026-07-15T08:00:00.000Z',
    );
  });

  it('a las 23:30 UTC del 30 de noviembre en Madrid ya es 1 de diciembre', () => {
    expect(calendarDateOf(new Date('2026-11-30T23:30:00Z'))).toEqual({ year: 2026, month: 12, day: 1 });
    expect(calendarDateOf(new Date('2026-11-30T22:59:59Z'))).toEqual({ year: 2026, month: 11, day: 30 });
  });

  it('cuenta los días de calendario entre dos fechas, también cambiando de mes', () => {
    expect(daysBetween({ year: 2026, month: 11, day: 19 }, { year: 2026, month: 12, day: 1 })).toBe(12);
    expect(daysBetween({ year: 2026, month: 12, day: 5 }, { year: 2026, month: 12, day: 3 })).toBe(-2);
  });
});
