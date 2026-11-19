import { SnowflakeIcon, SparkleIcon } from '../../../shared/presentation/components/cute-icons.component';
import { InstallHint } from '../../../shared/presentation/components/install-hint.component';
import { Countdown } from '../components/countdown.component';
import { DoorGrid } from '../components/door-grid.component';
import { SurpriseSheet } from '../components/surprise-sheet.component';
import { useAdventCalendarController } from '../controllers/use-advent-calendar.controller';

interface CalendarPageProps {
  onSignOut: () => void;
}

export function CalendarPage({ onSignOut }: CalendarPageProps) {
  const { view, loadError, opened, hint, openDoor, closeSurprise } = useAdventCalendarController();

  if (loadError) {
    return (
      <main className="page page--center">
        <p className="card">{loadError}</p>
        <button type="button" className="link-button" onClick={onSignOut}>
          Volver a entrar
        </button>
      </main>
    );
  }

  if (!view) {
    return (
      <main className="page page--center">
        <SnowflakeIcon size={42} className="loading-flake" />
      </main>
    );
  }

  const { season, calendar } = view;
  const today = calendar.doors.find((door) => door.isToday);

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Calendario de adviento {season.year}</p>
        <h1 className="script-title">
          para Alba <SparkleIcon size={28} className="hero__sparkle" />
        </h1>
      </header>

      {calendar.phase === 'waiting' && (
        <section className="card banner">
          <SparkleIcon size={20} className="banner__sparkle" />
          <h2 className="banner__title">{season.welcome.title}</h2>
          <p className="banner__message">{season.welcome.message}</p>
          <p className="banner__caption">Faltan</p>
          <Countdown target={calendar.startsAt} now={calendar.now} />
        </section>
      )}

      {calendar.phase === 'advent' && (
        <section className="card banner banner--compact">
          <h2 className="banner__title">
            {today?.state === 'opened'
              ? `Ya has abierto la puerta del día ${calendar.currentDay}`
              : `¡Hoy es día ${calendar.currentDay}! Tu puerta te espera`}
          </h2>
          {calendar.nextUnlockAt && (
            <p className="banner__caption">
              Próxima sorpresa en <Countdown target={calendar.nextUnlockAt} now={calendar.now} size="small" />
            </p>
          )}
          {!calendar.nextUnlockAt && <p className="banner__caption">¡Es la última puerta! 🎄</p>}
        </section>
      )}

      {calendar.phase === 'finished' && (
        <section className="card banner banner--compact">
          <h2 className="banner__title">¡Feliz Navidad, Alba! 🎄</h2>
          <p className="banner__caption">Todas las puertas están abiertas para volver a verlas.</p>
        </section>
      )}

      <InstallHint />

      <DoorGrid doors={calendar.doors} onOpen={openDoor} />

      <footer className="page__footer">
        <button type="button" className="link-button" onClick={onSignOut}>
          Cerrar sesión
        </button>
      </footer>

      {hint && (
        <div className="toast" role="status" key={`${hint.day}-${hint.message}`}>
          {hint.message}
        </div>
      )}

      {opened && <SurpriseSheet key={opened.surprise.day} opened={opened} onClose={closeSurprise} />}
    </main>
  );
}
