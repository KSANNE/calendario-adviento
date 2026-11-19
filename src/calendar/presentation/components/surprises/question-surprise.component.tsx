import { useState, type FormEvent } from 'react';

interface QuestionSurpriseProps {
  question: string;
  answer: string | undefined;
  sent: boolean;
  onAnswer: (answer: string) => Promise<boolean>;
}

export function QuestionSurprise({ question, answer, sent, onAnswer }: QuestionSurpriseProps) {
  const [editing, setEditing] = useState(!answer);
  const [draft, setDraft] = useState(answer ?? '');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    if (await onAnswer(draft)) setEditing(false);
    setSaving(false);
  };

  return (
    <div className="question">
      <p className="question__text">{question}</p>
      {editing ? (
        <form className="question__form" onSubmit={(event) => void submit(event)}>
          <textarea
            className="question__input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Escribe aquí tu respuesta…"
            rows={4}
            maxLength={1000}
          />
          <button type="submit" className="cute-button cute-button--small" disabled={saving || !draft.trim()}>
            Guardar respuesta
          </button>
          <p className="question__note">Las respuestas las sabré, así que fíjate bien :P</p>
        </form>
      ) : (
        <div className="question__saved">
          <p className="question__saved-label">Tu respuesta</p>
          <p className="question__saved-answer">{answer}</p>
          {sent && <p className="question__sent">¡Enviada! ✉️</p>}
          <button type="button" className="link-button" onClick={() => setEditing(true)}>
            Cambiar respuesta
          </button>
        </div>
      )}
    </div>
  );
}
