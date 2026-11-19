import { InvalidCredentialsError } from './invalid-credentials.error';

/** Usuario y contraseña tal y como se usan para sacar la clave: sin espacios y el usuario en minúsculas. */
export class Credentials {
  readonly username: string;
  readonly password: string;

  private constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  static create(username: string, password: string): Credentials {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();
    if (!cleanUsername || !cleanPassword) {
      throw new InvalidCredentialsError('Escribe tu usuario y tu contraseña');
    }
    return new Credentials(cleanUsername, cleanPassword);
  }
}
