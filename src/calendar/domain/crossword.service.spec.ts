import { describe, expect, it } from 'vitest';
import type { CrosswordWord } from './surprise.entity';
import { buildCrossword, cellKey, checkCrossword, normalizeLetters } from './crossword.service';

// Crucigrama de ejemplo (el de verdad va cifrado):
//   G A T O
//       A
//       Z O R R O
//       A       S
//               O
const words: CrosswordWord[] = [
  { answer: 'Gato', clue: '…', row: 0, col: 0, direction: 'across' },
  { answer: 'Taza', clue: '…', row: 0, col: 2, direction: 'down' },
  { answer: 'Zorro', clue: '…', row: 2, col: 2, direction: 'across' },
  { answer: 'Oso', clue: '…', row: 2, col: 6, direction: 'down' },
];

describe('crossword.service', () => {
  it('quita tildes y deja la Ñ', () => {
    expect(normalizeLetters('Canción')).toBe('CANCION');
    expect(normalizeLetters('ñu')).toBe('ÑU');
  });

  it('monta la cuadrícula con las palabras cruzadas y las numera en orden de lectura', () => {
    const grid = buildCrossword(words);

    expect(grid.rows).toBe(5);
    expect(grid.cols).toBe(7);
    expect(grid.cells.get(cellKey(0, 2))?.letter).toBe('T'); // GATO cruza con TAZA
    expect(grid.cells.get(cellKey(2, 6))?.letter).toBe('O'); // ZORRO cruza con OSO
    expect(grid.words.map((word) => [word.answer, word.number])).toEqual([
      ['GATO', 1],
      ['TAZA', 2],
      ['ZORRO', 3],
      ['OSO', 4],
    ]);
  });

  it('avisa si dos palabras no encajan en una casilla', () => {
    expect(() =>
      buildCrossword([
        { answer: 'SOL', clue: '…', row: 0, col: 0, direction: 'across' },
        { answer: 'MAR', clue: '…', row: 0, col: 0, direction: 'down' },
      ]),
    ).toThrow(/no|M/);
  });

  it('dice qué casillas están mal y cuándo está resuelto', () => {
    const grid = buildCrossword(words);
    const allRight = Object.fromEntries([...grid.cells.values()].map((cell) => [cell.key, cell.letter]));

    expect(checkCrossword(grid, allRight).solved).toBe(true);

    const oneWrong = { ...allRight, [cellKey(0, 0)]: 'X' };
    const check = checkCrossword(grid, oneWrong);
    expect(check.solved).toBe(false);
    expect([...check.wrong]).toEqual([cellKey(0, 0)]);
  });
});
