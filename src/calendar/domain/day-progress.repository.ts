import type { DayProgress } from './day-progress.entity';

export interface DayProgressRepository {
  get(day: number): Promise<DayProgress>;
  save(day: number, progress: DayProgress): Promise<void>;
}
