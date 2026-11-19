import type { DayProgress } from '../domain/day-progress.entity';
import type { DayProgressRepository } from '../domain/day-progress.repository';
import { SurpriseActionError } from '../domain/surprise-action.error';
import type { UnlockedSurpriseService } from './unlocked-surprise.service';

/** Responde una pregunta del test. Cada pregunta solo se puede responder una vez. */
export class AnswerQuizUseCase {
  private readonly unlocked: UnlockedSurpriseService;
  private readonly progress: DayProgressRepository;

  constructor(unlocked: UnlockedSurpriseService, progress: DayProgressRepository) {
    this.unlocked = unlocked;
    this.progress = progress;
  }

  async execute(day: number, question: number, option: number): Promise<DayProgress> {
    const surprise = await this.unlocked.getOfKind(day, 'quiz');
    const options = surprise.questions[question]?.options;
    if (!options || !Number.isInteger(option) || option < 0 || option >= options.length) {
      throw new SurpriseActionError('Esa respuesta no existe');
    }

    const current = await this.progress.get(day);
    if (current.quizPicks?.[question] !== undefined) return current;

    const next = { ...current, quizPicks: { ...current.quizPicks, [question]: option } };
    await this.progress.save(day, next);
    return next;
  }
}
