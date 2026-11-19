import type { WelcomeMessage } from './surprise.entity';

/** El calendario de un año: del 1 de diciembre a `totalDays` de diciembre. */
export interface AdventSeason {
  year: number;
  totalDays: number;
  /** Mensaje que ve Alba mientras espera a que empiece. */
  welcome: WelcomeMessage;
}
