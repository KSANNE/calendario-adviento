import type { DayProgress } from '../domain/day-progress.entity';
import type { DayProgressRepository } from '../domain/day-progress.repository';
import type { OpenedDoorsRepository } from '../domain/opened-doors.repository';
import type { Surprise } from '../domain/surprise.entity';
import type { UnlockedSurpriseService } from './unlocked-surprise.service';

export interface OpenedSurprise {
  surprise: Surprise;
  progress: DayProgress;
  /** Para los vales que dependen de una pregunta anterior: lo que Alba respondió (null si no respondió). */
  linkedAnswer: string | null;
}

/** Abre una puerta solo si ya ha llegado su día, y la deja marcada como abierta. */
export class OpenDoorUseCase {
  private readonly unlocked: UnlockedSurpriseService;
  private readonly openedDoors: OpenedDoorsRepository;
  private readonly progress: DayProgressRepository;

  constructor(
    unlocked: UnlockedSurpriseService,
    openedDoors: OpenedDoorsRepository,
    progress: DayProgressRepository,
  ) {
    this.unlocked = unlocked;
    this.openedDoors = openedDoors;
    this.progress = progress;
  }

  async execute(day: number): Promise<OpenedSurprise> {
    const surprise = await this.unlocked.get(day);
    await this.openedDoors.markOpened(day);

    const progress = await this.progress.get(day);
    const linkedAnswer =
      surprise.kind === 'voucher' && surprise.answerFromDay
        ? ((await this.progress.get(surprise.answerFromDay)).answer ?? null)
        : null;

    return { surprise, progress, linkedAnswer };
  }
}
