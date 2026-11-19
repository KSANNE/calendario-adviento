import type { AdventSeason } from './advent-season.entity';
import type { Surprise } from './surprise.entity';

/** Las sorpresas guardadas (cifradas). Solo se pueden leer con la sesión abierta. */
export interface SurpriseRepository {
  getSeason(): Promise<AdventSeason>;
  getSurprise(day: number): Promise<Surprise>;
}
