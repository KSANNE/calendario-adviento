export class InvalidCredentialsError extends Error {
  constructor(message = 'Usuario o contraseña incorrectos') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}
