import {
  decryptJson,
  deriveKey,
  exportKey,
  importKey,
  SEASON_LABEL,
  secretOf,
} from '../../shared/infrastructure/crypto/aes-gcm.cipher';
import type { VaultFileGateway } from '../../shared/infrastructure/vault-file.gateway';
import type { VaultSessionStore } from '../../shared/infrastructure/vault-session.store';
import type { AccessRepository } from '../domain/access.repository';
import type { Credentials } from '../domain/credentials.vo';
import { InvalidCredentialsError } from '../domain/invalid-credentials.error';

/** La contraseña es buena si la clave que sale de ella descifra el bloque de la temporada. */
export class WebCryptoAccessRepository implements AccessRepository {
  private readonly vault: VaultFileGateway;
  private readonly session: VaultSessionStore;

  constructor(vault: VaultFileGateway, session: VaultSessionStore) {
    this.vault = vault;
    this.session = session;
  }

  async signIn(credentials: Credentials): Promise<void> {
    const file = await this.vault.load();
    const key = await deriveKey(secretOf(credentials.username, credentials.password), file.kdf, true);
    if (!(await this.opens(key))) throw new InvalidCredentialsError();
    this.session.open(key, await exportKey(key));
  }

  async resume(): Promise<boolean> {
    const remembered = this.session.remembered();
    if (!remembered) return false;
    try {
      const key = await importKey(remembered);
      if (await this.opens(key)) {
        this.session.open(key, remembered);
        return true;
      }
    } catch {
      // Clave recordada estropeada o de un calendario anterior.
    }
    this.session.close();
    return false;
  }

  signOut(): void {
    this.session.close();
  }

  private async opens(key: CryptoKey): Promise<boolean> {
    const file = await this.vault.load();
    try {
      await decryptJson(key, file.season, SEASON_LABEL);
      return true;
    } catch {
      return false;
    }
  }
}
