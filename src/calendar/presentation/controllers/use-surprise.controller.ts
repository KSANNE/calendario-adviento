import { useCallback, useState } from 'react';
import { container } from '../../../app/container';
import type { OpenedSurprise } from '../../application/open-door.use-case';
import type { DayProgress } from '../../domain/day-progress.entity';

/** Lo que Alba hace dentro de una puerta abierta: responder, rascar, jugar… Todo se guarda en su móvil. */
export function useSurpriseController(opened: OpenedSurprise) {
  const day = opened.surprise.day;
  const [progress, setProgress] = useState<DayProgress>(opened.progress);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<DayProgress>): Promise<boolean> => {
    try {
      setProgress(await action());
      setError(null);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Algo ha fallado, prueba otra vez');
      return false;
    }
  }, []);

  const answerQuestion = useCallback(
    (answer: string) => run(() => container.calendar.answerQuestion.execute(day, answer)),
    [day, run],
  );

  const chooseCard = useCallback(
    (card: number) => run(() => container.calendar.chooseScratchCard.execute(day, card)),
    [day, run],
  );

  const answerQuiz = useCallback(
    (question: number, option: number) =>
      run(() => container.calendar.answerQuiz.execute(day, question, option)),
    [day, run],
  );

  const saveCrossword = useCallback(
    (letters: Record<string, string>) => run(() => container.calendar.saveCrossword.execute(day, letters)),
    [day, run],
  );

  return { progress, error, answerQuestion, chooseCard, answerQuiz, saveCrossword };
}
