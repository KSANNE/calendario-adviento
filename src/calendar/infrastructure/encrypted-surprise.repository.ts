import { dayLabel, decryptJson, SEASON_LABEL } from '../../shared/infrastructure/crypto/aes-gcm.cipher';
import type { VaultFileGateway } from '../../shared/infrastructure/vault-file.gateway';
import type { VaultSessionStore } from '../../shared/infrastructure/vault-session.store';
import type { AdventSeason } from '../domain/advent-season.entity';
import type { Surprise } from '../domain/surprise.entity';
import { parseSurpriseContent, parseWelcomeMessage } from '../domain/surprise-content.schema';
import type { SurpriseRepository } from '../domain/surprise.repository';

/** Lo que hay dentro del bloque cifrado de la temporada. */
interface RawSeason {
  year: number;
  totalDays: number;
  welcome: unknown;
  web3formsKey?: unknown;
}

/** Descifra las sorpresas con la clave de la sesión. Cada día se descifra solo cuando se abre su puerta. */
export class EncryptedSurpriseRepository implements SurpriseRepository {
  private readonly vault: VaultFileGateway;
  private readonly session: VaultSessionStore;
  private cachedSeason: { key: CryptoKey; raw: Promise<RawSeason> } | null = null;

  constructor(vault: VaultFileGateway, session: VaultSessionStore) {
    this.vault = vault;
    this.session = session;
  }

  async getSeason(): Promise<AdventSeason> {
    const raw = await this.rawSeason();
    return { year: raw.year, totalDays: raw.totalDays, welcome: parseWelcomeMessage(raw.welcome) };
  }

  /** Clave de Web3Forms para enviar las respuestas (va cifrada con el resto de la temporada). */
  async getAnswerNotifierKey(): Promise<string | null> {
    const key = (await this.rawSeason()).web3formsKey;
    return typeof key === 'string' && key.trim() ? key.trim() : null;
  }

  private rawSeason(): Promise<RawSeason> {
    const key = this.requireKey();
    if (this.cachedSeason?.key !== key) {
      const raw = this.vault
        .load()
        .then((file) => decryptJson(key, file.season, SEASON_LABEL))
        .then((value) => value as RawSeason);
      this.cachedSeason = { key, raw };
    }
    return this.cachedSeason.raw;
  }

  async getSurprise(day: number): Promise<Surprise> {
    const key = this.requireKey();
    const block = (await this.vault.load()).days[String(day)];
    if (!block) throw new Error(`No hay sorpresa guardada para el día ${day}`);
    const content = parseSurpriseContent(await decryptJson(key, block, dayLabel(day)), `Día ${day}`);
    return { ...content, day };
  }

  private requireKey(): CryptoKey {
    const key = this.session.current();
    if (!key) throw new Error('La sesión está cerrada');
    return key;
  }
}
