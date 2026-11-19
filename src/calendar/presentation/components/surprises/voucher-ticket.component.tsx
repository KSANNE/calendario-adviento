import { StarIcon } from '../../../../shared/presentation/components/cute-icons.component';

interface VoucherTicketProps {
  voucher: string;
  /** Lo que respondió Alba, si el vale depende de una pregunta. */
  linkedAnswer?: string | null;
  answerFromDay?: number;
  compact?: boolean;
}

/** Cupón con borde troquelado, como los de papel. También se usa en el rasca y gana. */
export function VoucherTicket({ voucher, linkedAnswer, answerFromDay, compact = false }: VoucherTicketProps) {
  return (
    <div className={`ticket ${compact ? 'ticket--compact' : ''}`}>
      <p className="ticket__label">
        <StarIcon size={14} /> Vale <StarIcon size={14} />
      </p>
      <p className="ticket__text">{voucher}</p>
      {answerFromDay !== undefined &&
        (linkedAnswer ? (
          <blockquote className="ticket__answer">
            <span className="ticket__answer-label">Lo que me dijiste el día {answerFromDay}:</span>«
            {linkedAnswer}»
          </blockquote>
        ) : (
          <p className="ticket__hint">(El plan que me dijiste el día {answerFromDay}).</p>
        ))}
      {!compact && <p className="ticket__footer">Enséñamelo para canjearlo</p>}
    </div>
  );
}
