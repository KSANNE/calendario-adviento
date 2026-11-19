/**
 * - `locked`: todavía no ha llegado su día.
 * - `available`: ya ha llegado su día y aún no se ha abierto.
 * - `opened`: ya se abrió alguna vez (se puede volver a ver).
 */
export type DoorState = 'locked' | 'available' | 'opened';

export interface Door {
  day: number;
  state: DoorState;
  isToday: boolean;
  /** Días que faltan para poder abrirla (0 si ya se puede). */
  daysLeft: number;
}
