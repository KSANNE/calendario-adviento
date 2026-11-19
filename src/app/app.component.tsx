import { useSessionController } from '../access/presentation/controllers/use-session.controller';
import { LoginPage } from '../access/presentation/pages/login.page';
import { CalendarPage } from '../calendar/presentation/pages/calendar.page';
import { SnowflakeIcon } from '../shared/presentation/components/cute-icons.component';
import { FloatingDecor } from '../shared/presentation/components/floating-decor.component';

export function App() {
  const { status, error, signIn, signOut } = useSessionController();

  return (
    <>
      <FloatingDecor />
      {status === 'checking' && (
        <main className="page page--center">
          <SnowflakeIcon size={42} className="loading-flake" />
        </main>
      )}
      {(status === 'signedOut' || status === 'signingIn') && (
        <LoginPage
          busy={status === 'signingIn'}
          error={error}
          onSignIn={(user, pass) => void signIn(user, pass)}
        />
      )}
      {status === 'signedIn' && <CalendarPage onSignOut={signOut} />}
    </>
  );
}
