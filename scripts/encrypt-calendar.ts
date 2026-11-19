// Cifra las sorpresas en tu PC: `npm run encrypt`.
// Lee contenido/sorpresas.json (que NUNCA se sube) y escribe public/calendario.enc.json (lo único que se publica).
// La contraseña se pide por la terminal; también se puede pasar en CALENDARIO_USUARIO / CALENDARIO_PASSWORD.
// Antes de cifrar comprueba cada día con las mismas reglas que usa la web, para que no se cuele ningún error.
import { readFileSync, writeFileSync } from 'node:fs';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import type { AdventSeason } from '../src/calendar/domain/advent-season.entity';
import type { SurpriseContent } from '../src/calendar/domain/surprise.entity';
import { buildCrossword } from '../src/calendar/domain/crossword.service.ts';
import { parseSurpriseContent, parseWelcomeMessage } from '../src/calendar/domain/surprise-content.schema.ts';
import {
  dayLabel,
  deriveKey,
  encryptJson,
  randomSalt,
  SEASON_LABEL,
  secretOf,
  VAULT_ITERATIONS,
  type KdfParams,
  type VaultFile,
} from '../src/shared/infrastructure/crypto/aes-gcm.cipher.ts';

const SOURCE = 'contenido/sorpresas.json';
const TARGET = 'public/calendario.enc.json';

function fail(message: string): never {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

/** La temporada cifrada lleva además, si la hay, la clave de Web3Forms para enviar las respuestas. */
type SeasonBlock = AdventSeason & { web3formsKey?: string };

function readSource(): { season: SeasonBlock; days: SurpriseContent[] } {
  let raw: {
    year?: unknown;
    totalDays?: unknown;
    welcome?: unknown;
    web3formsKey?: unknown;
    days?: Record<string, unknown>;
  };
  try {
    raw = JSON.parse(readFileSync(SOURCE, 'utf8')) as typeof raw;
  } catch (error) {
    fail(
      `No puedo leer ${SOURCE} (${error instanceof Error ? error.message : error}).\n` +
        '  Cópialo desde contenido/sorpresas.example.json y rellénalo.',
    );
  }
  const { year, totalDays } = raw;
  if (!Number.isInteger(year) || !Number.isInteger(totalDays) || (totalDays as number) < 1) {
    fail('Faltan "year" o "totalDays" en el archivo de sorpresas.');
  }

  try {
    if (
      raw.web3formsKey !== undefined &&
      (typeof raw.web3formsKey !== 'string' || !raw.web3formsKey.trim())
    ) {
      throw new Error('"web3formsKey" tiene que ser el texto de la clave (o quitarlo)');
    }
    const season: SeasonBlock = {
      year: year as number,
      totalDays: totalDays as number,
      welcome: parseWelcomeMessage(raw.welcome),
      web3formsKey: (raw.web3formsKey as string | undefined)?.trim(),
    };
    const days = Array.from({ length: season.totalDays }, (_, index) => {
      const day = index + 1;
      const content = parseSurpriseContent(raw.days?.[String(day)], `Día ${day}`);
      if (content.kind === 'crossword') buildCrossword(content.words);
      if (content.kind === 'voucher' && content.answerFromDay !== undefined) {
        const linked = raw.days?.[String(content.answerFromDay)] as { kind?: string } | undefined;
        if (content.answerFromDay >= day || linked?.kind !== 'question') {
          throw new Error(`Día ${day}: "answerFromDay" tiene que ser un día anterior que sea una pregunta`);
        }
      }
      return content;
    });
    return { season, days };
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

async function ask(question: string, hidden = false): Promise<string> {
  const terminal = createInterface({ input: stdin, output: stdout, terminal: true });
  if (hidden) {
    // Mientras se escribe la contraseña no se enseña nada en pantalla.
    const writable = terminal as unknown as { _writeToOutput: (text: string) => void };
    writable._writeToOutput = (text) => {
      if (text.startsWith(question)) stdout.write(question);
      else if (text.includes('\n') || text.includes('\r')) stdout.write('\n');
    };
  }
  const answer = await terminal.question(question);
  terminal.close();
  return answer;
}

async function readCredentials(): Promise<{ username: string; password: string }> {
  let username = process.env.CALENDARIO_USUARIO ?? '';
  let password = process.env.CALENDARIO_PASSWORD ?? '';
  if (!username) username = await ask('Usuario: ');
  if (!password) {
    password = await ask('Contraseña: ', true);
    if ((await ask('Repite la contraseña: ', true)) !== password) fail('Las contraseñas no coinciden.');
  }
  // Misma limpieza que Credentials en la web: sin espacios y el usuario en minúsculas.
  username = username.trim().toLowerCase();
  password = password.trim();
  if (!username || !password) fail('El usuario y la contraseña no pueden estar vacíos.');
  return { username, password };
}

const { season, days } = readSource();
console.log(`✓ ${days.length} días comprobados: ${days.map((content) => content.kind).join(', ')}`);
console.log(
  season.web3formsKey
    ? '✓ Envío de respuestas por correo: activado'
    : '· Envío de respuestas por correo: sin configurar (falta "web3formsKey")',
);
const { username, password } = await readCredentials();

/**
 * Se reutiliza la "sal" del archivo anterior: con la misma contraseña sale la misma clave y Alba sigue con la
 * sesión abierta aunque cambies sorpresas. Con `npm run encrypt -- --nueva-sal` se genera una nueva
 * (por ejemplo si cambias la contraseña), y entonces tendrá que volver a entrar.
 */
function previousSalt(): string | null {
  if (process.argv.includes('--nueva-sal')) return null;
  try {
    const previous = JSON.parse(readFileSync(TARGET, 'utf8')) as Partial<VaultFile>;
    return previous.kdf?.iterations === VAULT_ITERATIONS && previous.kdf.salt ? previous.kdf.salt : null;
  } catch {
    return null;
  }
}

console.log(`\nCifrando (esto tarda un par de segundos)…`);
const salt = previousSalt() ?? randomSalt();
const kdf: KdfParams = { name: 'PBKDF2', hash: 'SHA-256', iterations: VAULT_ITERATIONS, salt };
const key = await deriveKey(secretOf(username, password), kdf);

const encryptedDays: VaultFile['days'] = {};
for (const [index, content] of days.entries()) {
  encryptedDays[String(index + 1)] = await encryptJson(key, content, dayLabel(index + 1));
}

const vault: VaultFile = {
  version: 1,
  kdf,
  season: await encryptJson(key, season, SEASON_LABEL),
  days: encryptedDays,
};
writeFileSync(TARGET, `${JSON.stringify(vault, null, 2)}\n`);
console.log(`✓ Listo: ${TARGET}`);
