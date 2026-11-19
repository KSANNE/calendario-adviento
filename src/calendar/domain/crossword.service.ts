// Monta la cuadrícula del crucigrama a partir de las palabras y comprueba las letras escritas.
// También lo usa el script de cifrado para avisar si dos palabras no encajan, por eso no importa nada en ejecución.
import type { CrosswordDirection, CrosswordWord } from './surprise.entity';

export interface PlacedWord {
  index: number;
  number: number;
  answer: string;
  clue: string;
  direction: CrosswordDirection;
  /** Claves de sus casillas, en orden de lectura. */
  cells: string[];
}

export interface CrosswordCell {
  key: string;
  row: number;
  col: number;
  letter: string;
  /** Número que se ve en la esquina si aquí empieza alguna palabra. */
  number?: number;
  across?: number;
  down?: number;
}

export interface CrosswordGrid {
  rows: number;
  cols: number;
  cells: Map<string, CrosswordCell>;
  words: PlacedWord[];
}

export interface CrosswordCheck {
  wrong: Set<string>;
  filled: number;
  total: number;
  solved: boolean;
}

export const cellKey = (row: number, col: number): string => `${row}:${col}`;

/** Mayúsculas y sin tildes, pero respetando la Ñ. */
export function normalizeLetters(text: string): string {
  return [...text.toUpperCase()]
    .map((char) => (char === 'Ñ' ? char : (char.normalize('NFD')[0] ?? '')))
    .filter((char) => /^[A-ZÑ]$/.test(char))
    .join('');
}

export function buildCrossword(words: CrosswordWord[]): CrosswordGrid {
  const cells = new Map<string, CrosswordCell>();
  let rows = 0;
  let cols = 0;

  const placed = words.map((word, index) => {
    const answer = normalizeLetters(word.answer);
    if (!answer) throw new Error(`La palabra ${index + 1} del crucigrama está vacía`);
    const keys = [...answer].map((letter, offset) => {
      const row = word.row + (word.direction === 'down' ? offset : 0);
      const col = word.col + (word.direction === 'across' ? offset : 0);
      const key = cellKey(row, col);
      const existing = cells.get(key);
      if (existing && existing.letter !== letter) {
        throw new Error(
          `En el crucigrama, "${word.answer}" pone una ${letter} donde otra palabra tiene una ${existing.letter}`,
        );
      }
      const cell = existing ?? { key, row, col, letter };
      cell[word.direction === 'across' ? 'across' : 'down'] = index;
      cells.set(key, cell);
      rows = Math.max(rows, row + 1);
      cols = Math.max(cols, col + 1);
      return key;
    });
    return { index, answer, clue: word.clue, direction: word.direction, cells: keys };
  });

  // Números en orden de lectura (de arriba abajo y de izquierda a derecha), como en un crucigrama de papel.
  const firstCell = (word: { cells: string[] }): CrosswordCell => {
    const cell = cells.get(word.cells[0] ?? '');
    if (!cell) throw new Error('Palabra del crucigrama sin casillas');
    return cell;
  };
  [...new Set(placed.map(firstCell))]
    .sort((a, b) => a.row - b.row || a.col - b.col)
    .forEach((cell, position) => {
      cell.number = position + 1;
    });

  return {
    rows,
    cols,
    cells,
    words: placed.map((word) => ({ ...word, number: firstCell(word).number ?? 0 })),
  };
}

export function checkCrossword(
  grid: CrosswordGrid,
  letters: Readonly<Record<string, string>>,
): CrosswordCheck {
  const wrong = new Set<string>();
  let filled = 0;
  for (const cell of grid.cells.values()) {
    const typed = letters[cell.key];
    if (!typed) continue;
    filled++;
    if (typed !== cell.letter) wrong.add(cell.key);
  }
  const total = grid.cells.size;
  return { wrong, filled, total, solved: filled === total && wrong.size === 0 };
}
