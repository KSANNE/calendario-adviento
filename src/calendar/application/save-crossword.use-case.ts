import { buildCrossword, normalizeLetters } from '../domain/crossword.service';
import type { DayProgress } from '../domain/day-progress.entity';
import type { DayProgressRepository } from '../domain/day-progress.repository';
import type { UnlockedSurpriseService } from './unlocked-surprise.service';

/** Guarda las letras escritas en el crucigrama (solo las de casillas que existen, una letra por casilla). */
export class SaveCrosswordUseCase {
  private readonly unlocked: UnlockedSurpriseService;
  private readonly progress: DayProgressRepository;

  constructor(unlocked: UnlockedSurpriseService, progress: DayProgressRepository) {
    this.unlocked = unlocked;
    this.progress = progress;
  }

  async execute(day: number, letters: Readonly<Record<string, string>>): Promise<DayProgress> {
    const surprise = await this.unlocked.getOfKind(day, 'crossword');
    const grid = buildCrossword(surprise.words);

    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(letters)) {
      const letter = normalizeLetters(value).slice(-1);
      if (grid.cells.has(key) && letter) clean[key] = letter;
    }

    const next = { ...(await this.progress.get(day)), crosswordLetters: clean };
    await this.progress.save(day, next);
    return next;
  }
}
