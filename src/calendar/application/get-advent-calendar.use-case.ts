import type { Clock } from '../../shared/domain/clock';
import type { AdventSeason } from '../domain/advent-season.entity';
import { buildAdventCalendar, type AdventCalendar } from '../domain/advent-calendar.service';
import type { OpenedDoorsRepository } from '../domain/opened-doors.repository';
import type { SurpriseRepository } from '../domain/surprise.repository';

export interface AdventCalendarView {
  season: AdventSeason;
  calendar: AdventCalendar;
}

export class GetAdventCalendarUseCase {
  private readonly surprises: SurpriseRepository;
  private readonly openedDoors: OpenedDoorsRepository;
  private readonly clock: Clock;

  constructor(surprises: SurpriseRepository, openedDoors: OpenedDoorsRepository, clock: Clock) {
    this.surprises = surprises;
    this.openedDoors = openedDoors;
    this.clock = clock;
  }

  async execute(): Promise<AdventCalendarView> {
    const [season, opened] = await Promise.all([this.surprises.getSeason(), this.openedDoors.list()]);
    return { season, calendar: buildAdventCalendar(season, this.clock(), opened) };
  }
}
