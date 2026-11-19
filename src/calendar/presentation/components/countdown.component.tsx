interface CountdownProps {
  target: Date;
  now: Date;
  size?: 'big' | 'small';
}

function partsUntil(target: Date, now: Date) {
  const total = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (value: number) => String(value).padStart(2, '0');

export function Countdown({ target, now, size = 'big' }: CountdownProps) {
  const { days, hours, minutes, seconds } = partsUntil(target, now);

  if (size === 'small') {
    return (
      <span className="countdown-small">
        {days > 0 && `${days} d `}
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    );
  }

  const units = [
    { value: days, label: days === 1 ? 'día' : 'días' },
    { value: hours, label: hours === 1 ? 'hora' : 'horas' },
    { value: minutes, label: minutes === 1 ? 'minuto' : 'minutos' },
    { value: seconds, label: seconds === 1 ? 'segundo' : 'segundos' },
  ];

  return (
    <div className="countdown" role="timer" aria-live="off">
      {units.map((unit, index) => (
        <div key={index} className={`countdown__bubble shade-${index + 1}`}>
          <span className="countdown__value">{index === 0 ? unit.value : pad(unit.value)}</span>
          <span className="countdown__label">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
