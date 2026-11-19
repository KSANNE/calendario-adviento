import { SnowflakeIcon, SparkleIcon, StarIcon } from './cute-icons.component';

// Estrellas, copos y destellos que caen despacio por el fondo. Posiciones fijas para que no "salten" al recargar.
const ITEMS = Array.from({ length: 18 }, (_, index) => {
  const seed = (index * 37 + 11) % 100;
  return {
    kind: index % 3,
    left: (index * 53 + 7) % 100,
    size: 12 + (seed % 14),
    duration: 14 + (seed % 12),
    delay: -((index * 29) % 24),
    shade: index % 4,
  };
});

const ICONS = [StarIcon, SnowflakeIcon, SparkleIcon];

export function FloatingDecor() {
  return (
    <div className="floating-decor" aria-hidden="true">
      {ITEMS.map((item, index) => {
        const Icon = ICONS[item.kind] ?? StarIcon;
        return (
          <span
            key={index}
            className={`floating-decor__item shade-text-${item.shade}`}
            style={{
              left: `${item.left}%`,
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
            }}
          >
            <Icon size={item.size} />
          </span>
        );
      })}
    </div>
  );
}
