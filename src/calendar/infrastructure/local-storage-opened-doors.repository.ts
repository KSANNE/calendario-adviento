import type { OpenedDoorsRepository } from '../domain/opened-doors.repository';

const STORAGE_KEY = 'calendario-alba:abiertas';

/** Solo guarda los números de las puertas abiertas (no su contenido). */
export class LocalStorageOpenedDoorsRepository implements OpenedDoorsRepository {
  private memory = new Set<number>();

  async list(): Promise<ReadonlySet<number>> {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as unknown;
      if (Array.isArray(stored)) this.memory = new Set(stored.filter((day) => Number.isInteger(day)));
    } catch {
      // Sin almacenamiento: se usa lo que haya en memoria.
    }
    return new Set(this.memory);
  }

  async markOpened(day: number): Promise<void> {
    this.memory.add(day);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.memory].sort((a, b) => a - b)));
    } catch {
      // Sin almacenamiento: se recuerda solo mientras la app esté abierta.
    }
  }
}
