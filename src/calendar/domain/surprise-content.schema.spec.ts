import { describe, expect, it } from 'vitest';
import { InvalidSurpriseContentError, parseSurpriseContent } from './surprise-content.schema';

describe('parseSurpriseContent', () => {
  it('acepta una canción con su enlace de Spotify', () => {
    const song = parseSurpriseContent(
      {
        kind: 'song',
        title: 'Canción',
        message: 'Hola',
        song: { name: 'Canción', artist: 'Artista', spotify: 'track/0123456789abcdefABCDEF' },
      },
      'día 2',
    );
    expect(song.kind).toBe('song');
  });

  it('rechaza un enlace de Spotify que no es una canción ni un álbum', () => {
    expect(() =>
      parseSurpriseContent(
        { kind: 'song', title: 'x', song: { name: 'a', artist: 'b', spotify: 'https://spotify.com' } },
        'día 2',
      ),
    ).toThrow(InvalidSurpriseContentError);
  });

  it('rechaza un test cuya respuesta correcta no existe', () => {
    expect(() =>
      parseSurpriseContent(
        { kind: 'quiz', title: 'x', questions: [{ question: '¿?', options: ['a', 'b'], correct: 2 }] },
        'día 10',
      ),
    ).toThrow(/día 10, pregunta 1/);
  });

  it('una nota sin texto no vale', () => {
    expect(() => parseSurpriseContent({ kind: 'note', title: 'x' }, 'día 1')).toThrow(/message/);
  });

  it('descarta los campos que no conoce', () => {
    const voucher = parseSurpriseContent({ kind: 'voucher', title: 'x', voucher: 'Vale', extra: 1 }, 'día 4');
    expect(voucher).not.toHaveProperty('extra');
  });
});
