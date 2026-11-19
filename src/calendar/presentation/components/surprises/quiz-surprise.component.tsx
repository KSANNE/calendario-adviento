import type { QuizQuestion } from '../../../domain/surprise.entity';

interface QuizSurpriseProps {
  questions: QuizQuestion[];
  picks: Record<number, number> | undefined;
  onPick: (question: number, option: number) => Promise<boolean>;
}

/** Cada pregunta se responde una vez: si acierta, su botón se pone verde; si falla, el suyo rojo y el bueno verde. */
export function QuizSurprise({ questions, picks = {}, onPick }: QuizSurpriseProps) {
  const answered = Object.keys(picks).length;
  const hits = questions.filter((question, index) => picks[index] === question.correct).length;

  return (
    <div className="quiz">
      {questions.map((question, questionIndex) => {
        const picked = picks[questionIndex];
        const isAnswered = picked !== undefined;
        return (
          <section key={questionIndex} className="quiz__question">
            <p className="quiz__text">
              <span className="quiz__number">{questionIndex + 1}</span>
              {question.question}
            </p>
            <div className="quiz__options">
              {question.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === question.correct;
                const status = !isAnswered
                  ? ''
                  : isCorrect
                    ? 'is-correct'
                    : picked === optionIndex
                      ? 'is-wrong'
                      : 'is-faded';
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    className={`quiz__option ${status}`}
                    disabled={isAnswered}
                    onClick={() => void onPick(questionIndex, optionIndex)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {isAnswered && (
              <p className={`quiz__feedback ${picked === question.correct ? 'is-correct' : 'is-wrong'}`}>
                {picked === question.correct ? '¡Correcto!' : '¡Ups! Era la verde'}
              </p>
            )}
          </section>
        );
      })}
      {answered === questions.length && (
        <p className="quiz__score">
          Has acertado {hits} de {questions.length}
          {hits === questions.length
            ? '. ¡Memoria de elefante! 🐘'
            : hits === 0
              ? '. Se te ha pegado 😂'
              : ' 😉'}
        </p>
      )}
    </div>
  );
}
