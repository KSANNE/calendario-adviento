import { useEffect } from 'react';
import { BowIcon, SparkleIcon } from '../../../shared/presentation/components/cute-icons.component';
import type { OpenedSurprise } from '../../application/open-door.use-case';
import { useSurpriseController } from '../controllers/use-surprise.controller';
import { CrosswordSurprise } from './surprises/crossword-surprise.component';
import { QuestionSurprise } from './surprises/question-surprise.component';
import { QuizSurprise } from './surprises/quiz-surprise.component';
import { ScratchSurprise } from './surprises/scratch-surprise.component';
import { SongSurprise } from './surprises/song-surprise.component';
import { VoucherTicket } from './surprises/voucher-ticket.component';

interface SurpriseSheetProps {
  opened: OpenedSurprise;
  onClose: () => void;
}

export function SurpriseSheet({ opened, onClose }: SurpriseSheetProps) {
  const { surprise, linkedAnswer } = opened;
  const { progress, error, answerQuestion, chooseCard, answerQuiz, saveCrossword } =
    useSurpriseController(opened);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Que el calendario de detrás no se desplace mientras la tarjeta está abierta.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <article
        className={`surprise surprise--${surprise.kind}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="surprise-title"
        onClick={(event) => event.stopPropagation()}
      >
        <BowIcon size={64} className="surprise__bow" />
        <div className="surprise__scroll">
          <SparkleIcon size={18} className="surprise__sparkle surprise__sparkle--left" />
          <SparkleIcon size={14} className="surprise__sparkle surprise__sparkle--right" />
          <p className="surprise__day">Día {surprise.day}</p>
          <h2 id="surprise-title" className="surprise__title">
            {surprise.title}
          </h2>
          {surprise.kind === 'song' && (
            <p className="surprise__subtitle">
              {surprise.song.name} · {surprise.song.artist}
            </p>
          )}
          {surprise.message && <p className="surprise__message">{surprise.message}</p>}

          <div className="surprise__body">
            {surprise.kind === 'song' && <SongSurprise song={surprise.song} />}
            {surprise.kind === 'question' && (
              <QuestionSurprise
                question={surprise.question}
                answer={progress.answer}
                sent={Boolean(progress.answerSentAt)}
                onAnswer={answerQuestion}
              />
            )}
            {surprise.kind === 'voucher' && (
              <VoucherTicket
                voucher={surprise.voucher}
                linkedAnswer={linkedAnswer}
                answerFromDay={surprise.answerFromDay}
              />
            )}
            {surprise.kind === 'scratch' && (
              <ScratchSurprise
                prizes={surprise.prizes}
                chosenCard={progress.chosenCard}
                onChoose={chooseCard}
              />
            )}
            {surprise.kind === 'quiz' && (
              <QuizSurprise questions={surprise.questions} picks={progress.quizPicks} onPick={answerQuiz} />
            )}
            {surprise.kind === 'crossword' && (
              <CrosswordSurprise
                words={surprise.words}
                savedLetters={progress.crosswordLetters}
                onSave={saveCrossword}
              />
            )}
          </div>

          {error && (
            <p className="surprise__error" role="alert">
              {error}
            </p>
          )}
          {surprise.closing && <p className="surprise__closing">{surprise.closing}</p>}

          <button type="button" className="cute-button" onClick={onClose}>
            Cerrar <SparkleIcon size={18} />
          </button>
        </div>
      </article>
    </div>
  );
}
