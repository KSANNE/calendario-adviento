// Raíz de composición: el único sitio que conoce las implementaciones concretas.
import { ResumeSessionUseCase } from '../access/application/resume-session.use-case';
import { SignInUseCase } from '../access/application/sign-in.use-case';
import { SignOutUseCase } from '../access/application/sign-out.use-case';
import { WebCryptoAccessRepository } from '../access/infrastructure/web-crypto-access.repository';
import { AnswerQuestionUseCase } from '../calendar/application/answer-question.use-case';
import { AnswerQuizUseCase } from '../calendar/application/answer-quiz.use-case';
import { ChooseScratchCardUseCase } from '../calendar/application/choose-scratch-card.use-case';
import { GetAdventCalendarUseCase } from '../calendar/application/get-advent-calendar.use-case';
import { OpenDoorUseCase } from '../calendar/application/open-door.use-case';
import { SaveCrosswordUseCase } from '../calendar/application/save-crossword.use-case';
import { SendPendingAnswersUseCase } from '../calendar/application/send-pending-answers.use-case';
import { UnlockedSurpriseService } from '../calendar/application/unlocked-surprise.service';
import { EncryptedSurpriseRepository } from '../calendar/infrastructure/encrypted-surprise.repository';
import { LocalStorageDayProgressRepository } from '../calendar/infrastructure/local-storage-day-progress.repository';
import { LocalStorageOpenedDoorsRepository } from '../calendar/infrastructure/local-storage-opened-doors.repository';
import { Web3FormsAnswerNotifierGateway } from '../calendar/infrastructure/web3forms-answer-notifier.gateway';
import { systemClock } from '../shared/domain/clock';
import { createDateOverrideClock } from '../shared/infrastructure/date-override.clock';
import { VaultFileGateway } from '../shared/infrastructure/vault-file.gateway';
import { VaultSessionStore } from '../shared/infrastructure/vault-session.store';

function buildContainer() {
  // Cambiar la fecha con ?fecha=… solo funciona en desarrollo, nunca en la versión publicada.
  const clock = import.meta.env.DEV
    ? createDateOverrideClock(window.location.search, systemClock)
    : systemClock;

  const vault = new VaultFileGateway();
  const session = new VaultSessionStore();
  const access = new WebCryptoAccessRepository(vault, session);
  const surprises = new EncryptedSurpriseRepository(vault, session);
  const openedDoors = new LocalStorageOpenedDoorsRepository();
  const progress = new LocalStorageDayProgressRepository();
  const unlocked = new UnlockedSurpriseService(surprises, clock);
  const answerNotifier = new Web3FormsAnswerNotifierGateway(() => surprises.getAnswerNotifierKey());

  return {
    access: {
      signIn: new SignInUseCase(access),
      resumeSession: new ResumeSessionUseCase(access),
      signOut: new SignOutUseCase(access),
    },
    calendar: {
      getAdventCalendar: new GetAdventCalendarUseCase(surprises, openedDoors, clock),
      openDoor: new OpenDoorUseCase(unlocked, openedDoors, progress),
      answerQuestion: new AnswerQuestionUseCase(unlocked, progress, answerNotifier, clock),
      sendPendingAnswers: new SendPendingAnswersUseCase(surprises, unlocked, progress, answerNotifier, clock),
      chooseScratchCard: new ChooseScratchCardUseCase(unlocked, progress),
      answerQuiz: new AnswerQuizUseCase(unlocked, progress),
      saveCrossword: new SaveCrosswordUseCase(unlocked, progress),
    },
  };
}

export type Container = ReturnType<typeof buildContainer>;

export const container: Container = buildContainer();
