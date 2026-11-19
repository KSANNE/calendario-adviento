import { describe, expect, it } from 'vitest';
import type { AnswerNotice, AnswerNotifierGateway } from '../domain/answer-notifier.gateway';
import type { AdventSeason } from '../domain/advent-season.entity';
import type { DayProgress } from '../domain/day-progress.entity';
import type { DayProgressRepository } from '../domain/day-progress.repository';
import { DoorLockedError } from '../domain/door-locked.error';
import type { OpenedDoorsRepository } from '../domain/opened-doors.repository';
import type { Surprise } from '../domain/surprise.entity';
import { SurpriseActionError } from '../domain/surprise-action.error';
import type { SurpriseRepository } from '../domain/surprise.repository';
import { AnswerQuestionUseCase } from './answer-question.use-case';
import { AnswerQuizUseCase } from './answer-quiz.use-case';
import { ChooseScratchCardUseCase } from './choose-scratch-card.use-case';
import { OpenDoorUseCase } from './open-door.use-case';
import { SaveCrosswordUseCase } from './save-crossword.use-case';
import { SendPendingAnswersUseCase } from './send-pending-answers.use-case';
import { UnlockedSurpriseService } from './unlocked-surprise.service';

const season: AdventSeason = { year: 2026, totalDays: 24, welcome: { title: 'Hola', message: '…' } };

function surpriseOf(day: number): Surprise {
  switch (day) {
    case 3:
      return { day, kind: 'question', title: 'Pregunta', question: '¿Qué plan?' };
    case 6:
      return { day, kind: 'scratch', title: 'Rasca', prizes: ['Premio A', 'Premio B', 'Premio C'] };
    case 10:
      return {
        day,
        kind: 'quiz',
        title: 'Test',
        questions: [{ question: '¿Pregunta?', options: ['Opción A', 'Opción B'], correct: 1 }],
      };
    case 11:
      return { day, kind: 'voucher', title: 'Vale', voucher: 'El plan del día 3', answerFromDay: 3 };
    case 17:
      return {
        day,
        kind: 'crossword',
        title: 'Crucigrama',
        words: [{ answer: 'Gato', clue: 'Animal', row: 0, col: 0, direction: 'across' }],
      };
    default:
      return { day, kind: 'note', title: `Día ${day}`, message: 'sorpresa' };
  }
}

class FakeSurprises implements SurpriseRepository {
  readonly read: number[] = [];
  async getSeason() {
    return season;
  }
  async getSurprise(day: number): Promise<Surprise> {
    this.read.push(day);
    return surpriseOf(day);
  }
}

class FakeOpenedDoors implements OpenedDoorsRepository {
  readonly opened = new Set<number>();
  async list() {
    return new Set(this.opened);
  }
  async markOpened(day: number) {
    this.opened.add(day);
  }
}

class FakeProgress implements DayProgressRepository {
  readonly stored = new Map<number, DayProgress>();
  async get(day: number) {
    return this.stored.get(day) ?? {};
  }
  async save(day: number, progress: DayProgress) {
    this.stored.set(day, progress);
  }
}

class FakeNotifier implements AnswerNotifierGateway {
  online = true;
  readonly sent: AnswerNotice[] = [];
  async notify(notice: AnswerNotice) {
    if (!this.online) return false;
    this.sent.push(notice);
    return true;
  }
}

function setUp(isoNow: string) {
  const surprises = new FakeSurprises();
  const openedDoors = new FakeOpenedDoors();
  const progress = new FakeProgress();
  const notifier = new FakeNotifier();
  const clock = () => new Date(isoNow);
  const unlocked = new UnlockedSurpriseService(surprises, clock);
  return {
    surprises,
    openedDoors,
    progress,
    notifier,
    openDoor: new OpenDoorUseCase(unlocked, openedDoors, progress),
    answerQuestion: new AnswerQuestionUseCase(unlocked, progress, notifier, clock),
    sendPending: new SendPendingAnswersUseCase(surprises, unlocked, progress, notifier, clock),
    chooseCard: new ChooseScratchCardUseCase(unlocked, progress),
    answerQuiz: new AnswerQuizUseCase(unlocked, progress),
    saveCrossword: new SaveCrosswordUseCase(unlocked, progress),
  };
}

describe('OpenDoorUseCase', () => {
  it('abre la puerta de hoy y la marca como abierta', async () => {
    const { openDoor, openedDoors } = setUp('2026-12-02T10:00:00Z');

    await expect(openDoor.execute(2)).resolves.toMatchObject({ surprise: { day: 2 }, progress: {} });
    expect(openedDoors.opened.has(2)).toBe(true);
  });

  it('deja abrir días pasados que no se abrieron', async () => {
    const { openDoor } = setUp('2026-12-10T10:00:00Z');

    await expect(openDoor.execute(2)).resolves.toMatchObject({ surprise: { day: 2 } });
  });

  it('no descifra ni marca una puerta del futuro', async () => {
    const { openDoor, surprises, openedDoors } = setUp('2026-12-03T10:00:00Z');

    const error = await openDoor.execute(6).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(DoorLockedError);
    expect((error as DoorLockedError).daysLeft).toBe(3);
    expect(surprises.read).toEqual([]);
    expect(openedDoors.opened.size).toBe(0);
  });

  it('antes de diciembre no se abre ninguna', async () => {
    const { openDoor } = setUp('2026-11-19T10:00:00Z');

    await expect(openDoor.execute(1)).rejects.toBeInstanceOf(DoorLockedError);
  });

  it('el vale del día 11 trae lo que Alba respondió el día 3', async () => {
    const { openDoor, answerQuestion } = setUp('2026-12-11T10:00:00Z');
    await answerQuestion.execute(3, '  Plan de ejemplo  ');

    await expect(openDoor.execute(11)).resolves.toMatchObject({ linkedAnswer: 'Plan de ejemplo' });
  });

  it('si no respondió, el vale no trae respuesta', async () => {
    const { openDoor } = setUp('2026-12-11T10:00:00Z');

    await expect(openDoor.execute(11)).resolves.toMatchObject({ linkedAnswer: null });
  });
});

describe('acciones dentro de las puertas', () => {
  it('no se puede responder a una pregunta vacía ni en una puerta que no es pregunta', async () => {
    const { answerQuestion } = setUp('2026-12-11T10:00:00Z');

    await expect(answerQuestion.execute(3, '   ')).rejects.toBeInstanceOf(SurpriseActionError);
    await expect(answerQuestion.execute(4, 'hola')).rejects.toBeInstanceOf(SurpriseActionError);
  });

  it('no se puede responder una pregunta de un día que aún no ha llegado', async () => {
    const { answerQuestion } = setUp('2026-12-02T10:00:00Z');

    await expect(answerQuestion.execute(3, 'hola')).rejects.toBeInstanceOf(DoorLockedError);
  });

  it('en el rasca y gana solo vale la primera tarjeta elegida', async () => {
    const { chooseCard } = setUp('2026-12-06T10:00:00Z');

    await chooseCard.execute(6, 1);
    await expect(chooseCard.execute(6, 2)).resolves.toMatchObject({ chosenCard: 1 });
  });

  it('cada pregunta del test solo se responde una vez', async () => {
    const { answerQuiz } = setUp('2026-12-10T10:00:00Z');

    await answerQuiz.execute(10, 0, 0);
    await expect(answerQuiz.execute(10, 0, 1)).resolves.toMatchObject({ quizPicks: { 0: 0 } });
    await expect(answerQuiz.execute(10, 0, 5)).rejects.toBeInstanceOf(SurpriseActionError);
  });

  it('el crucigrama guarda una letra en mayúscula por casilla y descarta casillas que no existen', async () => {
    const { saveCrossword } = setUp('2026-12-17T10:00:00Z');

    await expect(saveCrossword.execute(17, { '0:0': 'r', '0:1': 'ú', '5:5': 'X' })).resolves.toEqual({
      crosswordLetters: { '0:0': 'R', '0:1': 'U' },
    });
  });

  it('al responder, la respuesta le llega a Raúl con su pregunta', async () => {
    const { answerQuestion, notifier } = setUp('2026-12-03T10:00:00Z');

    const saved = await answerQuestion.execute(3, 'Plan de ejemplo');
    expect(notifier.sent).toEqual([{ day: 3, question: '¿Qué plan?', answer: 'Plan de ejemplo' }]);
    expect(saved.answerSentAt).toBe('2026-12-03T10:00:00.000Z');
  });

  it('si no hay conexión se guarda igual y se envía más tarde', async () => {
    const { answerQuestion, sendPending, notifier } = setUp('2026-12-03T10:00:00Z');
    notifier.online = false;

    const saved = await answerQuestion.execute(3, 'Plan de ejemplo');
    expect(saved).toMatchObject({ answer: 'Plan de ejemplo', answerSentAt: undefined });

    notifier.online = true;
    await expect(sendPending.execute()).resolves.toBe(1);
    await expect(sendPending.execute()).resolves.toBe(0);
    expect(notifier.sent).toHaveLength(1);
  });
});
