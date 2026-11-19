import type { AnswerNotice, AnswerNotifierGateway } from '../domain/answer-notifier.gateway';

const ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Envía la respuesta al correo de Raúl con Web3Forms (gratis, pensado para webs sin servidor).
 * La clave de acceso va dentro del contenido cifrado, así que no aparece en el repositorio público.
 */
export class Web3FormsAnswerNotifierGateway implements AnswerNotifierGateway {
  private readonly accessKey: () => Promise<string | null>;

  constructor(accessKey: () => Promise<string | null>) {
    this.accessKey = accessKey;
  }

  async notify(notice: AnswerNotice): Promise<boolean> {
    const key = await this.accessKey().catch(() => null);
    if (!key) return false;
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          subject: `Calendario de adviento · Respuesta del día ${notice.day}`,
          from_name: 'Calendario de adviento',
          pregunta: notice.question,
          respuesta: notice.answer,
        }),
      });
      const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
      return response.ok && result?.success === true;
    } catch {
      return false;
    }
  }
}
