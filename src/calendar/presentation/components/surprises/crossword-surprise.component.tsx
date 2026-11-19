import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  buildCrossword,
  cellKey,
  checkCrossword,
  normalizeLetters,
  type PlacedWord,
} from '../../../domain/crossword.service';
import type { CrosswordWord } from '../../../domain/surprise.entity';

interface CrosswordSurpriseProps {
  words: CrosswordWord[];
  savedLetters: Record<string, string> | undefined;
  onSave: (letters: Record<string, string>) => Promise<boolean>;
}

export function CrosswordSurprise({ words, savedLetters, onSave }: CrosswordSurpriseProps) {
  const grid = useMemo(() => buildCrossword(words), [words]);
  const [letters, setLetters] = useState<Record<string, string>>(savedLetters ?? {});
  const [activeWord, setActiveWord] = useState<number>(0);
  const [checked, setChecked] = useState(false);
  const inputs = useRef(new Map<string, HTMLInputElement>());

  const check = checkCrossword(grid, letters);
  const active = grid.words[activeWord];
  const activeCells = new Set(active?.cells ?? []);

  const focusCell = (key: string | undefined) => {
    if (key) inputs.current.get(key)?.focus();
  };

  const wordsAt = (key: string): PlacedWord[] => {
    const cell = grid.cells.get(key);
    return [cell?.across, cell?.down]
      .map((index) => (index === undefined ? undefined : grid.words[index]))
      .filter((word): word is PlacedWord => word !== undefined);
  };

  const selectWordFor = (key: string, toggle: boolean) => {
    const options = wordsAt(key);
    const current = options.findIndex((word) => word.index === activeWord);
    const next = current === -1 ? options[0] : toggle ? options[(current + 1) % options.length] : undefined;
    if (next) setActiveWord(next.index);
  };

  const save = (next: Record<string, string>) => {
    setLetters(next);
    setChecked(false);
    void onSave(next);
  };

  const step = (key: string, direction: 1 | -1) => {
    if (!active) return;
    const position = active.cells.indexOf(key);
    focusCell(active.cells[position + direction]);
  };

  const onType = (key: string, value: string) => {
    let typed = normalizeLetters(value);
    // Al escribir sobre una casilla llena llega "letra vieja + nueva": nos quedamos con lo nuevo.
    const previous = letters[key];
    if (previous && typed.length > 1 && typed.startsWith(previous)) typed = typed.slice(1);

    const next = Object.fromEntries(Object.entries(letters).filter(([cell]) => cell !== key));
    if (!typed) {
      save(next);
      return;
    }

    // Si llegan varias letras de golpe (sugerencia del teclado o pegar), se reparten por la palabra.
    const cells = active?.cells ?? [key];
    const start = Math.max(0, cells.indexOf(key));
    const targets = cells.slice(start, start + typed.length);
    targets.forEach((cell, offset) => {
      next[cell] = typed[offset] ?? '';
    });
    save(next);
    focusCell(cells[start + targets.length] ?? targets[targets.length - 1]);
  };

  const onKeyDown = (key: string, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !letters[key]) {
      event.preventDefault();
      step(key, -1);
    }
  };

  const goToWord = (word: PlacedWord) => {
    setActiveWord(word.index);
    focusCell(word.cells.find((key) => !letters[key]) ?? word.cells[0]);
  };

  const across = grid.words.filter((word) => word.direction === 'across');
  const down = grid.words.filter((word) => word.direction === 'down');

  return (
    <div className="crossword">
      <div
        className="crossword__grid"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }}
        role="grid"
        aria-label="Crucigrama"
      >
        {Array.from({ length: grid.rows * grid.cols }, (_, position) => {
          const row = Math.floor(position / grid.cols);
          const col = position % grid.cols;
          const key = cellKey(row, col);
          const cell = grid.cells.get(key);
          if (!cell) return <span key={key} className="crossword__empty" />;
          const status = check.solved
            ? 'is-correct'
            : checked && letters[key]
              ? check.wrong.has(key)
                ? 'is-wrong'
                : 'is-correct'
              : '';
          return (
            <label
              key={key}
              className={`crossword__cell ${activeCells.has(key) ? 'is-active' : ''} ${status}`}
            >
              {cell.number && <span className="crossword__number">{cell.number}</span>}
              <input
                ref={(element) => {
                  if (element) inputs.current.set(key, element);
                  else inputs.current.delete(key);
                }}
                className="crossword__input"
                value={letters[key] ?? ''}
                onChange={(event) => onType(key, event.target.value)}
                onKeyDown={(event) => onKeyDown(key, event)}
                onFocus={() => selectWordFor(key, false)}
                onClick={() => selectWordFor(key, true)}
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={check.solved}
                aria-label={`Fila ${row + 1}, columna ${col + 1}`}
              />
            </label>
          );
        })}
      </div>

      {check.solved ? (
        <p className="crossword__solved">¡Crucigrama completado! 🎉</p>
      ) : (
        <button
          type="button"
          className="cute-button cute-button--small cute-button--soft"
          onClick={() => setChecked(true)}
          disabled={check.filled === 0}
        >
          Comprobar
        </button>
      )}

      <div className="crossword__clues">
        <ClueList title="Horizontales" words={across} activeWord={activeWord} onSelect={goToWord} />
        <ClueList title="Verticales" words={down} activeWord={activeWord} onSelect={goToWord} />
      </div>
    </div>
  );
}

interface ClueListProps {
  title: string;
  words: PlacedWord[];
  activeWord: number;
  onSelect: (word: PlacedWord) => void;
}

function ClueList({ title, words, activeWord, onSelect }: ClueListProps) {
  if (words.length === 0) return null;
  return (
    <section>
      <h3 className="crossword__clues-title">{title}</h3>
      <ol className="crossword__clue-list">
        {words.map((word) => (
          <li key={word.index}>
            <button
              type="button"
              className={`crossword__clue ${word.index === activeWord ? 'is-active' : ''}`}
              onClick={() => onSelect(word)}
            >
              <span className="crossword__clue-number">{word.number}</span>
              {word.clue} <span className="crossword__clue-length">({word.answer.length})</span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
