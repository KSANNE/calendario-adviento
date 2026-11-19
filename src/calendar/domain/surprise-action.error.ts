/** Se intenta hacer algo que esa sorpresa no permite (por ejemplo, responder en una puerta que no es una pregunta). */
export class SurpriseActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SurpriseActionError';
  }
}
