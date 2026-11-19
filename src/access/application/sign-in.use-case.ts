import type { AccessRepository } from '../domain/access.repository';
import { Credentials } from '../domain/credentials.vo';

export class SignInUseCase {
  private readonly access: AccessRepository;

  constructor(access: AccessRepository) {
    this.access = access;
  }

  execute(username: string, password: string): Promise<void> {
    return this.access.signIn(Credentials.create(username, password));
  }
}
