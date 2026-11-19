import { useEffect, useRef, useState } from 'react';
import { SparkleIcon } from '../../../../shared/presentation/components/cute-icons.component';
import { VoucherTicket } from './voucher-ticket.component';

interface ScratchSurpriseProps {
  prizes: string[];
  chosenCard: number | undefined;
  onChoose: (card: number) => Promise<boolean>;
}

export function ScratchSurprise({ prizes, chosenCard, onChoose }: ScratchSurpriseProps) {
  // Si ya eligió en otra visita, su premio se ve directamente.
  const [revealed, setRevealed] = useState(chosenCard !== undefined);

  return (
    <div className="scratch">
      <div className="scratch__cards">
        {prizes.map((prize, index) => {
          const isChosen = chosenCard === index;
          const state =
            chosenCard === undefined
              ? 'idle'
              : isChosen
                ? revealed
                  ? 'revealed'
                  : 'scratching'
                : 'disabled';
          return (
            <ScratchCard
              key={index}
              number={index + 1}
              prize={prize}
              state={state}
              onStart={() => void onChoose(index)}
              onReveal={() => setRevealed(true)}
            />
          );
        })}
      </div>
      {chosenCard === undefined && <p className="scratch__help">Rasca con el dedo la que quieras.</p>}
      {chosenCard !== undefined && !revealed && <p className="scratch__help">¡Sigue rascando!</p>}
      {chosenCard !== undefined && revealed && (
        <div className="scratch__prize">
          <p className="scratch__help">¡Te ha tocado!</p>
          <VoucherTicket voucher={prizes[chosenCard] ?? ''} />
        </div>
      )}
    </div>
  );
}

type CardState = 'idle' | 'scratching' | 'revealed' | 'disabled';

interface ScratchCardProps {
  number: number;
  prize: string;
  state: CardState;
  onStart: () => void;
  onReveal: () => void;
}

const BRUSH = 22;
const REVEAL_RATIO = 0.45;

function ScratchCard({ number, prize, state, onStart, onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);

  // Pinta la capa para rascar (naranja con destellos) al tamaño real de la tarjeta.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || state === 'revealed') return;
    const ratio = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext('2d');
    if (!context) return;
    const styles = getComputedStyle(canvas);
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, styles.getPropertyValue('--tone-400').trim() || '#ff9562');
    gradient.addColorStop(1, styles.getPropertyValue('--tone-600').trim() || '#ea5e22');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(255,255,255,0.35)';
    for (let index = 0; index < 14; index++) {
      const x = ((index * 37) % 100) / 100;
      const y = ((index * 61 + 13) % 100) / 100;
      context.beginPath();
      context.arc(x * canvas.width, y * canvas.height, (2 + (index % 3)) * ratio, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = `600 ${15 * ratio}px "Fredoka Variable", system-ui, sans-serif`;
    context.fillText(state === 'disabled' ? '—' : 'Rasca', canvas.width / 2, canvas.height / 2 - 9 * ratio);
    context.font = `500 ${12 * ratio}px "Fredoka Variable", system-ui, sans-serif`;
    if (state !== 'disabled') context.fillText('aquí', canvas.width / 2, canvas.height / 2 + 10 * ratio);
    // Solo se repinta al cambiar de "elegible" a "no elegible", nunca mientras se rasca.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state === 'disabled', state === 'revealed']);

  const scratchAt = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.width / rect.width;
    const point = { x: (event.clientX - rect.left) * ratio, y: (event.clientY - rect.top) * ratio };
    context.globalCompositeOperation = 'destination-out';
    context.lineCap = 'round';
    context.lineWidth = BRUSH * 2 * ratio;
    context.beginPath();
    context.moveTo(last.current?.x ?? point.x, last.current?.y ?? point.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    last.current = point;

    strokes.current++;
    if (strokes.current % 6 === 0 && clearedRatio(canvas) > REVEAL_RATIO) onReveal();
  };

  const canScratch = state === 'idle' || state === 'scratching';

  return (
    <div className={`scratch-card scratch-card--${state}`}>
      <div className="scratch-card__under">
        {state === 'disabled' ? (
          <span className="scratch-card__number">{number}</span>
        ) : (
          <>
            <SparkleIcon size={18} />
            <span className="scratch-card__prize">{prize}</span>
          </>
        )}
      </div>
      {state !== 'revealed' && (
        <canvas
          ref={canvasRef}
          className="scratch-card__cover"
          aria-label={canScratch ? `Rascar la tarjeta ${number}` : `Tarjeta ${number}, no elegida`}
          onPointerDown={(event) => {
            if (!canScratch) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            if (state === 'idle') onStart();
            last.current = null;
            scratchAt(event);
          }}
          onPointerMove={(event) => {
            if (canScratch && event.buttons > 0) scratchAt(event);
          }}
          onPointerUp={(event) => {
            last.current = null;
            const canvas = event.currentTarget;
            if (canScratch && clearedRatio(canvas) > REVEAL_RATIO) onReveal();
          }}
        />
      )}
    </div>
  );
}

/** Qué parte de la capa ya se ha rascado (mirando uno de cada 16 píxeles para que sea rápido). */
function clearedRatio(canvas: HTMLCanvasElement): number {
  const context = canvas.getContext('2d');
  if (!context || canvas.width === 0) return 0;
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let cleared = 0;
  let sampled = 0;
  for (let index = 3; index < data.length; index += 64) {
    sampled++;
    if ((data[index] ?? 0) === 0) cleared++;
  }
  return sampled === 0 ? 0 : cleared / sampled;
}
