// Cifrado del calendario con la Web Crypto API (la misma en el navegador y en Node):
//  - PBKDF2 + SHA-256 saca una clave AES de 256 bits a partir de usuario + contraseña y un "salt" aleatorio.
//  - AES-GCM cifra cada bloque. Si la clave no es la buena, descifrar FALLA: así se comprueba la contraseña
//    sin guardarla en ningún sitio (ni siquiera un hash).
//  - Cada bloque lleva una etiqueta (`season`, `day-5`…) como dato autenticado: no se pueden intercambiar bloques.
// Lo usan la web (descifrar) y scripts/encrypt-calendar.ts (cifrar en tu PC), por eso no importa nada en ejecución.

export interface EncryptedBlock {
  iv: string;
  data: string;
}

export interface KdfParams {
  name: 'PBKDF2';
  hash: 'SHA-256';
  iterations: number;
  salt: string;
}

/** Contenido de public/calendario.enc.json: lo único que se publica. */
export interface VaultFile {
  version: 1;
  kdf: KdfParams;
  season: EncryptedBlock;
  days: Record<string, EncryptedBlock>;
}

export const VAULT_ITERATIONS = 600_000;
export const SEASON_LABEL = 'season';
export const dayLabel = (day: number): string => `day-${day}`;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function randomSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)));
}

/** Usuario y contraseña ya limpios (ver Credentials) → texto secreto del que sale la clave. */
export function secretOf(username: string, password: string): string {
  return `${username}\u0000${password}`;
}

export async function deriveKey(secret: string, kdf: KdfParams, extractable = false): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(secret), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: kdf.hash, iterations: kdf.iterations, salt: fromBase64(kdf.salt) },
    material,
    { name: 'AES-GCM', length: 256 },
    extractable,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptJson(key: CryptoKey, value: unknown, label: string): Promise<EncryptedBlock> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(label) },
    key,
    encoder.encode(JSON.stringify(value)),
  );
  return { iv: toBase64(iv), data: toBase64(new Uint8Array(data)) };
}

/** Lanza un error si la clave no es la correcta o el bloque se ha tocado. */
export async function decryptJson(key: CryptoKey, block: EncryptedBlock, label: string): Promise<unknown> {
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(block.iv), additionalData: encoder.encode(label) },
    key,
    fromBase64(block.data),
  );
  return JSON.parse(decoder.decode(plain));
}

export async function exportKey(key: CryptoKey): Promise<string> {
  return toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', key)));
}

export function importKey(raw: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', fromBase64(raw), { name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}
