import type { DayProgress } from '../domain/day-progress.entity';
import type { DayProgressRepository } from '../domain/day-progress.repository';

// Las respuestas y partidas de Alba se quedan en su móvil: no se envían a ningún sitio.
const STORAGE_KEY = 'calendario-alba:progreso';

export class LocalStorageDayProgressRepository implements DayProgressRepository {
  private memory: Record<string, DayProgress> = {};

  async get(day: number): Promise<DayProgress> {
    return { ...this.readAll()[String(day)] };
  }

  async save(day: number, progress: DayProgress): Promise<void> {
    const all = { ...this.readAll(), [String(day)]: progress };
    this.memory = all;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Sin almacenamiento (modo privado): se recuerda solo mientras la app esté abierta.
    }
  }

  private readAll(): Record<string, DayProgress> {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as unknown;
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        this.memory = stored as Record<string, DayProgress>;
      }
    } catch {
      // Datos estropeados o sin almacenamiento: se usa lo que haya en memoria.
    }
    return this.memory;
  }
}
