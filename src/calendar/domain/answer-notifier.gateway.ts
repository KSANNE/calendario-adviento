export interface AnswerNotice {
  day: number;
  question: string;
  answer: string;
}

/** Le hace llegar a Raúl lo que Alba ha respondido (ella lo sabe: se le avisa debajo de la pregunta). */
export interface AnswerNotifierGateway {
  /** Devuelve true si se ha enviado; false si no hay envío configurado o ha fallado (se reintentará). */
  notify(notice: AnswerNotice): Promise<boolean>;
}
