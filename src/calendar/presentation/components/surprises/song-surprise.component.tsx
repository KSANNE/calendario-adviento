import type { SongContent } from '../../../domain/surprise.entity';

interface SongSurpriseProps {
  song: SongContent['song'];
}

/** Reproductor de Spotify dentro de la puerta. Sin sesión de Spotify en el navegador suena un fragmento. */
export function SongSurprise({ song }: SongSurpriseProps) {
  return (
    <div className="song">
      <iframe
        className="song__player"
        title={`${song.name} – ${song.artist}`}
        src={`https://open.spotify.com/embed/${song.spotify}?utm_source=generator`}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
      <a
        className="song__link"
        href={`https://open.spotify.com/${song.spotify}`}
        target="_blank"
        rel="noreferrer"
      >
        Abrir en Spotify
      </a>
    </div>
  );
}
