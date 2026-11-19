// Comprueba que cada sorpresa tiene lo que necesita su tipo.
// Lo usan el script de cifrado (para avisarte de errores antes de cifrar) y la web (al descifrar),
// por eso este archivo no importa nada en ejecución.
import type {
  CrosswordWord,
  QuizQuestion,
  SurpriseContent,
  SurpriseKind,
  WelcomeMessage,
} from './surprise.entity';

export class InvalidSurpriseContentError extends Error {
  constructor(where: string, problem: string) {
    super(`${where}: ${problem}`);
    this.name = 'InvalidSurpriseContentError';
  }
}

const KINDS: SurpriseKind[] = ['note', 'song', 'question', 'voucher', 'scratch', 'quiz', 'crossword'];
const SPOTIFY_PATH = /^(track|album)\/[A-Za-z0-9]{22}$/;

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(source: Json, field: string, where: string): string {
  const value = source[field];
  if (typeof value !== 'string' || !value.trim()) {
    throw new InvalidSurpriseContentError(where, `falta el texto "${field}"`);
  }
  return value;
}

function optionalText(source: Json, field: string, where: string): string | undefined {
  if (source[field] === undefined) return undefined;
  return text(source, field, where);
}

function list(source: Json, field: string, where: string, minLength: number): unknown[] {
  const value = source[field];
  if (!Array.isArray(value) || value.length < minLength) {
    throw new InvalidSurpriseContentError(
      where,
      `"${field}" tiene que ser una lista de al menos ${minLength}`,
    );
  }
  return value;
}

function integer(source: Json, field: string, where: string, min: number, max: number): number {
  const value = source[field];
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new InvalidSurpriseContentError(where, `"${field}" tiene que ser un número entre ${min} y ${max}`);
  }
  return value as number;
}

export function parseWelcomeMessage(value: unknown, where = 'welcome'): WelcomeMessage {
  if (!isObject(value)) throw new InvalidSurpriseContentError(where, 'falta el mensaje de bienvenida');
  return { title: text(value, 'title', where), message: text(value, 'message', where) };
}

function parseQuizQuestion(value: unknown, where: string): QuizQuestion {
  if (!isObject(value)) throw new InvalidSurpriseContentError(where, 'pregunta mal escrita');
  const options = list(value, 'options', where, 2).map((option, index) => {
    if (typeof option !== 'string' || !option.trim()) {
      throw new InvalidSurpriseContentError(where, `la opción ${index + 1} está vacía`);
    }
    return option;
  });
  return {
    question: text(value, 'question', where),
    options,
    correct: integer(value, 'correct', where, 0, options.length - 1),
  };
}

function parseCrosswordWord(value: unknown, where: string): CrosswordWord {
  if (!isObject(value)) throw new InvalidSurpriseContentError(where, 'palabra mal escrita');
  const direction = value.direction;
  if (direction !== 'across' && direction !== 'down') {
    throw new InvalidSurpriseContentError(where, '"direction" tiene que ser "across" o "down"');
  }
  return {
    answer: text(value, 'answer', where),
    clue: text(value, 'clue', where),
    row: integer(value, 'row', where, 0, 30),
    col: integer(value, 'col', where, 0, 30),
    direction,
  };
}

/** Devuelve la sorpresa limpia (solo los campos conocidos) o lanza un error que dice qué falta. */
export function parseSurpriseContent(value: unknown, where: string): SurpriseContent {
  if (!isObject(value)) throw new InvalidSurpriseContentError(where, 'falta la sorpresa');
  const kind = value.kind as SurpriseKind;
  if (!KINDS.includes(kind)) {
    throw new InvalidSurpriseContentError(where, `"kind" tiene que ser uno de: ${KINDS.join(', ')}`);
  }

  const base = {
    title: text(value, 'title', where),
    message: optionalText(value, 'message', where),
    closing: optionalText(value, 'closing', where),
  };

  switch (kind) {
    case 'note':
      if (!base.message) throw new InvalidSurpriseContentError(where, 'una nota necesita "message"');
      return { kind, ...base };
    case 'song': {
      const song = value.song;
      if (!isObject(song)) throw new InvalidSurpriseContentError(where, 'falta "song"');
      const spotify = text(song, 'spotify', where);
      if (!SPOTIFY_PATH.test(spotify)) {
        throw new InvalidSurpriseContentError(where, '"spotify" tiene que ser "track/<id>" o "album/<id>"');
      }
      return {
        kind,
        ...base,
        song: { name: text(song, 'name', where), artist: text(song, 'artist', where), spotify },
      };
    }
    case 'question':
      return { kind, ...base, question: text(value, 'question', where) };
    case 'voucher':
      return {
        kind,
        ...base,
        voucher: text(value, 'voucher', where),
        answerFromDay:
          value.answerFromDay === undefined ? undefined : integer(value, 'answerFromDay', where, 1, 31),
      };
    case 'scratch':
      return {
        kind,
        ...base,
        prizes: list(value, 'prizes', where, 2).map((prize, index) => {
          if (typeof prize !== 'string' || !prize.trim()) {
            throw new InvalidSurpriseContentError(where, `el premio ${index + 1} está vacío`);
          }
          return prize;
        }),
      };
    case 'quiz':
      return {
        kind,
        ...base,
        questions: list(value, 'questions', where, 1).map((question, index) =>
          parseQuizQuestion(question, `${where}, pregunta ${index + 1}`),
        ),
      };
    case 'crossword':
      return {
        kind,
        ...base,
        words: list(value, 'words', where, 1).map((word, index) =>
          parseCrosswordWord(word, `${where}, palabra ${index + 1}`),
        ),
      };
  }
}
