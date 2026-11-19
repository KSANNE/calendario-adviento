/** Qué puertas se han abierto ya en este dispositivo. */
export interface OpenedDoorsRepository {
  list(): Promise<ReadonlySet<number>>;
  markOpened(day: number): Promise<void>;
}
