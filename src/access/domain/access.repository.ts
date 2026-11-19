import type { Credentials } from './credentials.vo';

/** Abre y cierra la sesión que permite leer las sorpresas cifradas. */
export interface AccessRepository {
  /** Lanza InvalidCredentialsError si el usuario o la contraseña no abren el calendario. */
  signIn(credentials: Credentials): Promise<void>;
  /** Vuelve a abrir la sesión recordada en este dispositivo. Devuelve false si no hay ninguna válida. */
  resume(): Promise<boolean>;
  signOut(): void;
}
