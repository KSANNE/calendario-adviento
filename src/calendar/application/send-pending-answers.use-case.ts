import type { Clock } from '../../shared/domain/clock';
import type { AnswerNotifierGateway } from '../domain/answer-notifier.gateway';
import type { DayProgressRepository } from '../domain/day-progress.repository';
import type { SurpriseRepository } from '../domain/surprise.repository';
import type { UnlockedSurpriseService } from './unlocked-surprise.service';

/**
 * Reenvía las respuestas que no llegaron (sin conexión, o antes de configurar el envío).
 * Se llama al abrir el calendario; si no hay nada pendiente no hace nada.
 */
export class SendPendingAnswersUseCase {
  private readonly surprises: SurpriseRepository;
  private readonly unlocked: UnlockedSurpriseService;
  private readonly progress: DayProgressRepository;
  private readonly notifier: AnswerNotifierGateway;
  private readonly clock: Clock;

  constructor(
    surprises: SurpriseRepository,
    unlocked: UnlockedSurpriseService,
    progress: DayProgressRepository,
    notifier: AnswerNotifierGateway,
    clock: Clock,
  ) {
    this.surprises = surprises;
    this.unlocked = unlocked;
    this.progress = progress;
    this.notifier = notifier;
    this.clock = clock;
  }

  async execute(): Promise<number> {
    const season = await this.surprises.getSeason();
    let sent = 0;
    for (let day = 1; day <= season.totalDays; day++) {
      const progress = await this.progress.get(day);
      if (!progress.answer || progress.answerSentAt) continue;

      const surprise = await this.unlocked.get(day).catch(() => null);
      if (surprise?.kind !== 'question') continue;

      if (await this.notifier.notify({ day, question: surprise.question, answer: progress.answer })) {
        await this.progress.save(day, { ...progress, answerSentAt: this.clock().toISOString() });
        sent++;
      }
    }
    return sent;
  }
}
