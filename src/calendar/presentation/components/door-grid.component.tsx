import type { Door } from '../../domain/door.entity';
import { doorLayout } from '../utils/door-decor.util';
import { DoorTile } from './door.component';

interface DoorGridProps {
  doors: Door[];
  onOpen: (day: number) => Promise<boolean>;
}

export function DoorGrid({ doors, onOpen }: DoorGridProps) {
  const byDay = new Map(doors.map((door) => [door.day, door]));
  return (
    <section className="door-grid" aria-label="Puertas del calendario">
      {doorLayout(doors.length).map((day) => {
        const door = byDay.get(day);
        return door ? <DoorTile key={day} door={door} onOpen={onOpen} /> : null;
      })}
    </section>
  );
}
