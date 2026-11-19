/** Fuente de la hora actual; los tests la sustituyen por una fija. */
export type Clock = () => Date;

export const systemClock: Clock = () => new Date();
