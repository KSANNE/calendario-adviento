import { useCallback, useEffect, useState } from 'react';
import { container } from '../../../app/container';
import type { AdventCalendarView } from '../../application/get-advent-calendar.use-case';
import type { OpenedSurprise } from '../../application/open-door.use-case';
import { DoorLockedError } from '../../domain/door-locked.error';

export interface DoorHint {
  day: number;
  message: string;
}

/** Recalcula el calendario cada segundo (cuenta atrás y puertas que se desbloquean a medianoche). */
export function useAdventCalendarController() {
  const [view, setView] = useState<AdventCalendarView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [opened, setOpened] = useState<OpenedSurprise | null>(null);
  const [hint, setHint] = useState<DoorHint | null>(null);
  const [refreshes, setRefreshes] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      container.calendar.getAdventCalendar
        .execute()
        .then((next) => {
          if (!cancelled) setView(next);
        })
        .catch((error: unknown) => {
          if (!cancelled)
            setLoadError(error instanceof Error ? error.message : 'No se pudo abrir el calendario');
        });
    void refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [refreshes]);

  // Si alguna respuesta no llegó (sin conexión), se reintenta al abrir el calendario.
  useEffect(() => {
    void container.calendar.sendPendingAnswers.execute().catch(() => 0);
  }, []);

  useEffect(() => {
    if (!hint) return;
    const timer = window.setTimeout(() => setHint(null), 2600);
    return () => window.clearTimeout(timer);
  }, [hint]);

  const openDoor = useCallback(async (day: number): Promise<boolean> => {
    try {
      setOpened(await container.calendar.openDoor.execute(day));
      return true;
    } catch (error) {
      setHint({
        day,
        message:
          error instanceof DoorLockedError ? `${error.message} 🤫` : 'No he podido abrirla, prueba otra vez',
      });
      return false;
    }
  }, []);

  const closeSurprise = useCallback(() => {
    setOpened(null);
    setRefreshes((count) => count + 1);
  }, []);

  return { view, loadError, opened, hint, openDoor, closeSurprise };
}
