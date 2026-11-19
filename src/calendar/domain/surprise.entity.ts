/** Lo que hay detrás de cada puerta. Todos los tipos comparten título, texto opcional y una despedida opcional. */
interface SurpriseBase {
  title: string;
  message?: string;
  closing?: string;
}

export interface NoteContent extends SurpriseBase {
  kind: 'note';
}

export interface SongContent extends SurpriseBase {
  kind: 'song';
  /** `spotify` es la ruta del enlace de Spotify: `track/<id>` o `album/<id>`. */
  song: { name: string; artist: string; spotify: string };
}

/** Pregunta abierta: Alba escribe la respuesta y se guarda en su móvil. */
export interface QuestionContent extends SurpriseBase {
  kind: 'question';
  question: string;
}

export interface VoucherContent extends SurpriseBase {
  kind: 'voucher';
  voucher: string;
  /** Si se indica, el vale enseña lo que Alba respondió en la pregunta de ese día. */
  answerFromDay?: number;
}

/** Rasca y gana: solo se puede rascar una tarjeta. */
export interface ScratchContent extends SurpriseBase {
  kind: 'scratch';
  prizes: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Posición (desde 0) de la opción correcta. */
  correct: number;
}

export interface QuizContent extends SurpriseBase {
  kind: 'quiz';
  questions: QuizQuestion[];
}

export type CrosswordDirection = 'across' | 'down';

export interface CrosswordWord {
  answer: string;
  clue: string;
  /** Fila y columna (desde 0) de la primera letra. */
  row: number;
  col: number;
  direction: CrosswordDirection;
}

export interface CrosswordContent extends SurpriseBase {
  kind: 'crossword';
  words: CrosswordWord[];
}

export type SurpriseContent =
  | NoteContent
  | SongContent
  | QuestionContent
  | VoucherContent
  | ScratchContent
  | QuizContent
  | CrosswordContent;

export type SurpriseKind = SurpriseContent['kind'];

export type Surprise = SurpriseContent & { day: number };

/** Mensaje de la pantalla de espera, antes del 1 de diciembre. */
export interface WelcomeMessage {
  title: string;
  message: string;
}
