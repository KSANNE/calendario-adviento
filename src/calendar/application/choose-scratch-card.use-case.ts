import type { DayProgress } from '../domain/day-progress.entity';
import type { DayProgressRepository } from '../domain/day-progress.repository';
import { SurpriseActionError } from '../domain/surprise-action.error';
import type { UnlockedSurpriseService } from './unlocked-surprise.service';

/** Elige la tarjeta del rasca y gana. La primera elección es la que vale: no se puede cambiar. */
export class ChooseScratchCardUseCase {
  private readonly unlocked: UnlockedSurpriseService;
  private readonly progress: DayProgressRepository;

  constructor(unlocked: UnlockedSurpriseService, progress: DayProgressRepository) {
    this.unlocked = unlocked;
    this.progress = progress;
  }

  async execute(day: number, card: number): Promise<DayProgress> {
    const surprise = await this.unlocked.getOfKind(day, 'scratch');
    if (!Number.isInteger(card) || card < 0 || card >= surprise.prizes.length) {
      throw new SurpriseActionError('Esa tarjeta no existe');
    }

    const current = await this.progress.get(day);
    if (current.chosenCard !== undefined) return current;

    const next = { ...current, chosenCard: card };
    await this.progress.save(day, next);
    return next;
  }
}
