import type { AccessRepository } from '../domain/access.repository';

export class SignOutUseCase {
  private readonly access: AccessRepository;

  constructor(access: AccessRepository) {
    this.access = access;
  }

  execute(): void {
    this.access.signOut();
  }
}
