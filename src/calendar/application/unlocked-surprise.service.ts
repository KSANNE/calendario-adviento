import type { Clock } from '../../shared/domain/clock';
import { buildAdventCalendar } from '../domain/advent-calendar.service';
import { DoorLockedError } from '../domain/door-locked.error';
import type { Surprise, SurpriseKind } from '../domain/surprise.entity';
import { SurpriseActionError } from '../domain/surprise-action.error';
import type { SurpriseRepository } from '../domain/surprise.repository';

/** Da la sorpresa de un día solo si su puerta ya se puede abrir. Lo comparten todos los casos de uso de puertas. */
export class UnlockedSurpriseService {
  private readonly surprises: SurpriseRepository;
  private readonly clock: Clock;

  constructor(surprises: SurpriseRepository, clock: Clock) {
    this.surprises = surprises;
    this.clock = clock;
  }

  async get(day: number): Promise<Surprise> {
    const season = await this.surprises.getSeason();
    const door = buildAdventCalendar(season, this.clock(), new Set()).doors.find((item) => item.day === day);
    if (!door) throw new RangeError(`El calendario no tiene día ${day}`);
    if (door.state === 'locked') throw new DoorLockedError(day, door.daysLeft);
    return this.surprises.getSurprise(day);
  }

  async getOfKind<K extends SurpriseKind>(day: number, kind: K): Promise<Extract<Surprise, { kind: K }>> {
    const surprise = await this.get(day);
    if (surprise.kind !== kind)
      throw new SurpriseActionError(`La puerta del día ${day} no es de tipo ${kind}`);
    return surprise as Extract<Surprise, { kind: K }>;
  }
}
