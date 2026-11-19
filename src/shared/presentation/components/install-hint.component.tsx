import { useState } from 'react';
import { SparkleIcon } from './cute-icons.component';

// En el iPhone, Safari y la app de la pantalla de inicio guardan los datos por separado.
// Si Alba usa siempre la de la pantalla de inicio, sus respuestas (que se usan en días posteriores) no se pierden.
const DISMISSED_KEY = 'calendario-alba:aviso-inicio';

function shouldShow(): boolean {
  const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  if (!isIos || standalone) return false;
  try {
    return localStorage.getItem(DISMISSED_KEY) !== '1';
  } catch {
    return true;
  }
}

export function InstallHint() {
  const [visible, setVisible] = useState(shouldShow);
  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Sin almacenamiento: volverá a salir la próxima vez.
    }
  };

  return (
    <aside className="card install-hint">
      <SparkleIcon size={18} className="install-hint__icon" />
      <p className="install-hint__text">
        <strong>Truco:</strong> pulsa <em>Compartir</em> → <em>Añadir a pantalla de inicio</em> y ábreme
        siempre desde ahí. Así no se pierde nada de lo que respondas.
      </p>
      <button type="button" className="link-button install-hint__close" onClick={dismiss}>
        Vale
      </button>
    </aside>
  );
}
