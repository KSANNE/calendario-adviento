import { useEffect, useState } from 'react';
import {
  BowIcon,
  GiftIcon,
  OrnamentIcon,
  LockIcon,
  SnowflakeIcon,
  SparkleIcon,
  StarIcon,
} from '../../../shared/presentation/components/cute-icons.component';
import type { Door } from '../../domain/door.entity';
import { doorStyleOf, type DoorDecoration } from '../utils/door-decor.util';

const DECORATION_ICONS: Record<DoorDecoration, typeof StarIcon> = {
  ornament: OrnamentIcon,
  star: StarIcon,
  bow: BowIcon,
  snowflake: SnowflakeIcon,
  sparkle: SparkleIcon,
  gift: GiftIcon,
};

const SWING_MS = 700;

interface DoorProps {
  door: Door;
  onOpen: (day: number) => Promise<boolean>;
}

export function DoorTile({ door, onOpen }: DoorProps) {
  const [swinging, setSwinging] = useState(false);
  const [shaking, setShaking] = useState(false);
  const { shade, decoration } = doorStyleOf(door.day);
  const Decoration = DECORATION_ICONS[decoration];

  useEffect(() => {
    if (!shaking) return;
    const timer = window.setTimeout(() => setShaking(false), 500);
    return () => window.clearTimeout(timer);
  }, [shaking]);

  const handleClick = async () => {
    if (swinging) return;
    if (door.state === 'available') {
      setSwinging(true);
      await new Promise((resolve) => window.setTimeout(resolve, SWING_MS));
    }
    const opened = await onOpen(door.day);
    if (!opened) setShaking(true);
    setSwinging(false);
  };

  const isOpen = swinging || door.state === 'opened';
  const classes = [
    'door',
    `door--${door.state}`,
    `shade-${shade}`,
    door.isToday ? 'door--today' : '',
    isOpen ? 'is-open' : '',
    shaking ? 'is-shaking' : '',
  ].join(' ');

  const label =
    door.state === 'locked'
      ? `Día ${door.day}, cerrada`
      : door.state === 'opened'
        ? `Día ${door.day}, ver otra vez`
        : `Día ${door.day}, abrir`;

  return (
    <button type="button" className={classes} onClick={() => void handleClick()} aria-label={label}>
      <span className="door__inside" aria-hidden="true">
        <StarIcon size={26} />
      </span>
      <span className="door__panel" aria-hidden="true">
        <span className="door__decor">
          <Decoration size={18} />
        </span>
        <span className="door__number">{door.day}</span>
        {door.state === 'locked' && <LockIcon size={14} className="door__lock" />}
        <span className="door__knob" />
      </span>
      {door.isToday && door.state !== 'opened' && <span className="door__ribbon">¡hoy!</span>}
      {!door.isToday && door.state === 'available' && <span className="door__dot" aria-hidden="true" />}
    </button>
  );
}
