import type { VaultFile } from './crypto/aes-gcm.cipher';

/** Descarga public/calendario.enc.json (una vez por sesión). Es público: solo contiene datos cifrados. */
export class VaultFileGateway {
  private readonly url: string;
  private file: Promise<VaultFile> | null = null;

  constructor(url = './calendario.enc.json') {
    this.url = url;
  }

  load(): Promise<VaultFile> {
    this.file ??= this.fetchFile().catch((error: unknown) => {
      this.file = null;
      throw error;
    });
    return this.file;
  }

  private async fetchFile(): Promise<VaultFile> {
    const response = await fetch(this.url, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error('No encuentro el calendario cifrado. Ejecuta `npm run encrypt` para crearlo.');
    }
    const file = (await response.json()) as VaultFile;
    if (file.version !== 1 || !file.kdf || !file.season || !file.days) {
      throw new Error('El calendario cifrado no tiene el formato esperado.');
    }
    return file;
  }
}
