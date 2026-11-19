// La clave para descifrar vive en memoria mientras la app está abierta y, para no pedir la contraseña
// cada día, se recuerda en este dispositivo. Nunca se guarda la contraseña.
const STORAGE_KEY = 'calendario-alba:llave';

export class VaultSessionStore {
  private key: CryptoKey | null = null;

  current(): CryptoKey | null {
    return this.key;
  }

  open(key: CryptoKey, rememberedKey: string): void {
    this.key = key;
    try {
      localStorage.setItem(STORAGE_KEY, rememberedKey);
    } catch {
      // Sin almacenamiento (modo privado): la sesión dura hasta cerrar la app.
    }
  }

  remembered(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  close(): void {
    this.key = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada que borrar.
    }
  }
}
