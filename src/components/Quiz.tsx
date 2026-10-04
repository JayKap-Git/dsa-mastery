import { useEffect, useState } from 'react';
import type { QuizQuestion } from '../data/types';
import { T } from '../viz/engine/T';
import { recordQuiz } from '../lib/progress';

const KIND = {
  concept: { en: 'concept', hi: 'concept' },
  trace: { en: 'trace it', hi: 'trace karo' },
  complexity: { en: 'complexity', hi: 'complexity' },
  java: { en: 'java', hi: 'java' },
} as const;

export default function Quiz({ chapter, questions }: { chapter: string; questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.filter((p, i) => p === questions[i].answer).length;
  const finished = answered === questions.length;

  useEffect(() => {
    if (finished) recordQuiz(chapter, score, questions.length);
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="quiz">
      {questions.map((q, i) => {
        const p = picked[i];
        return (
          <div className="q-card" key={i}>
            <div className="q-head">
              <span className="q-num">Q{i + 1}</span>
              <span className="q-kind"><T v={KIND[q.kind]} ui /></span>
            </div>
            <p className="q-text"><T v={q.q} /></p>
            {q.code && <pre className="q-code">{q.code}</pre>}
            <div className="q-opts">
              {q.options.map((o, j) => {
                const cls = p === null ? '' : j === q.answer ? ' correct' : j === p ? ' wrong' : '';
                return (
                  <button
                    key={j} type="button" className={`q-opt${cls}`} disabled={p !== null}
                    onClick={() => setPicked((prev) => prev.map((v, k) => (k === i ? j : v)))}
                  >
                    <span className="q-letter">{String.fromCharCode(65 + j)}</span>
                    <span><T v={o} /></span>
                  </button>
                );
              })}
            </div>
            {p !== null && (
              <div className="q-explain" role="status">
                {p === q.answer
                  ? <b><T v={{ en: 'Correct. ', hi: 'Sahi jawab! ' }} /></b>
                  : <b className="no"><T v={{ en: 'Not quite. ', hi: 'Thoda miss hua. ' }} /></b>}
                <T v={q.explain} />
              </div>
            )}
          </div>
        );
      })}
      <div className="q-score" aria-live="polite">
        <span>
          {finished
            ? <T v={{ en: `Score: ${score}/${questions.length} — saved to your progress.`, hi: `Score: ${score}/${questions.length} — progress mein save ho gaya.` }} />
            : <T v={{ en: `Answered ${answered} of ${questions.length}.`, hi: `${questions.length} mein se ${answered} answer kiye.` }} />}
        </span>
        {answered > 0 && (
          <button type="button" className="btn-ghost" onClick={() => setPicked(questions.map(() => null))}>
            <T v={{ en: 'Try again', hi: 'Phir se try karo' }} ui />
          </button>
        )}
      </div>
    </div>
  );
}
