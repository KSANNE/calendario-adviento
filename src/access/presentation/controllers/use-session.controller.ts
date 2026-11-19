import { useCallback, useEffect, useState } from 'react';
import { container } from '../../../app/container';
import { InvalidCredentialsError } from '../../domain/invalid-credentials.error';

export type SessionStatus = 'checking' | 'signedOut' | 'signingIn' | 'signedIn';

export function useSessionController() {
  const [status, setStatus] = useState<SessionStatus>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    container.access.resumeSession
      .execute()
      .catch(() => false)
      .then((resumed) => {
        if (!cancelled) setStatus(resumed ? 'signedIn' : 'signedOut');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    setError(null);
    setStatus('signingIn');
    try {
      await container.access.signIn.execute(username, password);
      setStatus('signedIn');
    } catch (caught) {
      setError(
        caught instanceof InvalidCredentialsError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : 'Algo ha fallado, prueba otra vez',
      );
      setStatus('signedOut');
    }
  }, []);

  const signOut = useCallback(() => {
    container.access.signOut.execute();
    setError(null);
    setStatus('signedOut');
  }, []);

  return { status, error, signIn, signOut };
}
