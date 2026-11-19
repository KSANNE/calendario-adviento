import { useState, type FormEvent } from 'react';
import { BowIcon, GiftIcon, SparkleIcon } from '../../../shared/presentation/components/cute-icons.component';

interface LoginPageProps {
  busy: boolean;
  error: string | null;
  onSignIn: (username: string, password: string) => void;
}

export function LoginPage({ busy, error, onSignIn }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!busy) onSignIn(username, password);
  };

  return (
    <main className="login">
      <form className={`login__card ${error ? 'is-wrong' : ''}`} onSubmit={submit} key={error ?? 'ok'}>
        <div className="login__badge" aria-hidden="true">
          <GiftIcon size={54} className="login__gift" />
          <BowIcon size={34} className="login__bow" />
        </div>
        <p className="eyebrow">Calendario de adviento</p>
        <h1 className="script-title">Hola, Alba</h1>
        <p className="login__intro">
          Tu calendario te está esperando. Escribe tu usuario y tu contraseña para entrar.
        </p>

        <label className="field">
          <span className="field__label">Usuario</span>
          <input
            className="field__input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Tu nombre"
          />
        </label>
        <label className="field">
          <span className="field__label">Contraseña</span>
          <input
            className="field__input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="login__error" role="alert">
            {error}
          </p>
        )}

        <button className="cute-button" type="submit" disabled={busy}>
          {busy ? 'Abriendo tu calendario…' : 'Entrar'}
          {!busy && <SparkleIcon size={18} />}
        </button>
      </form>
    </main>
  );
}
