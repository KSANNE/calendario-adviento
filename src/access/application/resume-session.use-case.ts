import type { AccessRepository } from '../domain/access.repository';

export class ResumeSessionUseCase {
  private readonly access: AccessRepository;

  constructor(access: AccessRepository) {
    this.access = access;
  }

  execute(): Promise<boolean> {
    return this.access.resume();
  }
}
