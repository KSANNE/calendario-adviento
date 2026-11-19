import { describe, expect, it } from 'vitest';
import {
  dayLabel,
  decryptJson,
  deriveKey,
  encryptJson,
  exportKey,
  importKey,
  randomSalt,
  secretOf,
  type KdfParams,
} from './aes-gcm.cipher';

// Pocas iteraciones para que el test sea rápido; la app usa VAULT_ITERATIONS.
const kdf: KdfParams = { name: 'PBKDF2', hash: 'SHA-256', iterations: 1000, salt: randomSalt() };

describe('aes-gcm.cipher', () => {
  it('descifra con el mismo usuario y contraseña', async () => {
    const key = await deriveKey(secretOf('alba', 'clave'), kdf);
    const block = await encryptJson(key, { title: 'Hola' }, dayLabel(1));

    const sameKey = await deriveKey(secretOf('alba', 'clave'), kdf);
    await expect(decryptJson(sameKey, block, dayLabel(1))).resolves.toEqual({ title: 'Hola' });
  });

  it('no descifra con otra contraseña ni con otro usuario', async () => {
    const key = await deriveKey(secretOf('alba', 'clave'), kdf);
    const block = await encryptJson(key, { title: 'Hola' }, dayLabel(1));

    await expect(
      decryptJson(await deriveKey(secretOf('alba', 'otra'), kdf), block, dayLabel(1)),
    ).rejects.toThrow();
    await expect(
      decryptJson(await deriveKey(secretOf('otro', 'clave'), kdf), block, dayLabel(1)),
    ).rejects.toThrow();
  });

  it('el texto cifrado no contiene el contenido en claro', async () => {
    const key = await deriveKey(secretOf('alba', 'clave'), kdf);
    const block = await encryptJson(key, { title: 'Sorpresa secreta' }, dayLabel(1));

    expect(JSON.stringify(block)).not.toContain('Sorpresa');
  });

  it('un bloque de un día no se puede hacer pasar por el de otro', async () => {
    const key = await deriveKey(secretOf('alba', 'clave'), kdf);
    const block = await encryptJson(key, { title: 'Día 24' }, dayLabel(24));

    await expect(decryptJson(key, block, dayLabel(1))).rejects.toThrow();
  });

  it('la clave recordada en el dispositivo sigue abriendo los bloques', async () => {
    const key = await deriveKey(secretOf('alba', 'clave'), kdf, true);
    const block = await encryptJson(key, { ok: true }, 'season');

    const restored = await importKey(await exportKey(key));
    await expect(decryptJson(restored, block, 'season')).resolves.toEqual({ ok: true });
  });
});
