/** Lo que Alba ha hecho dentro de una puerta. Solo se guarda en su móvil. */
export interface DayProgress {
  /** Respuesta escrita a una pregunta abierta. */
  answer?: string;
  /** Cuándo se le envió a Raúl la respuesta actual (sin valor = pendiente de enviar). */
  answerSentAt?: string;
  /** Tarjeta elegida en el rasca y gana (no se puede cambiar). */
  chosenCard?: number;
  /** Opción elegida en cada pregunta del test: { númeroDePregunta: opción }. */
  quizPicks?: Record<number, number>;
  /** Letras escritas en el crucigrama: { "fila:columna": letra }. */
  crosswordLetters?: Record<string, string>;
}
