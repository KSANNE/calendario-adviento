export class DoorLockedError extends Error {
  readonly day: number;
  readonly daysLeft: number;

  constructor(day: number, daysLeft: number) {
    super(daysLeft === 1 ? 'Esta puerta se abre mañana' : `Faltan ${daysLeft} días para abrir esta puerta`);
    this.name = 'DoorLockedError';
    this.day = day;
    this.daysLeft = daysLeft;
  }
}
