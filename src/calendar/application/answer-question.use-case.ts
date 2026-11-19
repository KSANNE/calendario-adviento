import type { Clock } from '../../shared/domain/clock';
import type { AnswerNotifierGateway } from '../domain/answer-notifier.gateway';
import type { DayProgress } from '../domain/day-progress.entity';
import type { DayProgressRepository } from '../domain/day-progress.repository';
import { SurpriseActionError } from '../domain/surprise-action.error';
import type { UnlockedSurpriseService } from './unlocked-surprise.service';

const MAX_LENGTH = 1000;

/** Guarda (o cambia) la respuesta de Alba a una pregunta abierta y se la hace llegar a Raúl. */
export class AnswerQuestionUseCase {
  private readonly unlocked: UnlockedSurpriseService;
  private readonly progress: DayProgressRepository;
  private readonly notifier: AnswerNotifierGateway;
  private readonly clock: Clock;

  constructor(
    unlocked: UnlockedSurpriseService,
    progress: DayProgressRepository,
    notifier: AnswerNotifierGateway,
    clock: Clock,
  ) {
    this.unlocked = unlocked;
    this.progress = progress;
    this.notifier = notifier;
    this.clock = clock;
  }

  async execute(day: number, answer: string): Promise<DayProgress> {
    const surprise = await this.unlocked.getOfKind(day, 'question');
    const clean = answer.trim();
    if (!clean) throw new SurpriseActionError('Escribe tu respuesta antes de guardarla');
    if (clean.length > MAX_LENGTH)
      throw new SurpriseActionError(`La respuesta no puede pasar de ${MAX_LENGTH} letras`);

    const current = await this.progress.get(day);
    if (current.answer === clean && current.answerSentAt) return current;

    // Primero se guarda: aunque falle el envío, la respuesta no se pierde y se reintenta más tarde.
    const saved: DayProgress = { ...current, answer: clean, answerSentAt: undefined };
    await this.progress.save(day, saved);

    const sent = await this.notifier.notify({ day, question: surprise.question, answer: clean });
    if (!sent) return saved;

    const delivered = { ...saved, answerSentAt: this.clock().toISOString() };
    await this.progress.save(day, delivered);
    return delivered;
  }
}
