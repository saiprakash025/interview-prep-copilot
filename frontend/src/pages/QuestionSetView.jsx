import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const TAG_LABEL = { aptitude: 'APT', technical: 'TECH', hr: 'HR' };
const DIFFICULTY_BAR = { easy: '▁', medium: '▃', hard: '▅' };

export default function QuestionSetView() {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [attempts, setAttempts] = useState({}); // { questionIndex: status }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/questionsets/${id}`)
      .then((res) => setSet(res.data))
      .catch(() => setError('Could not load this question set.'))
      .finally(() => setLoading(false));
  }, [id]);

  const markStatus = async (index, status) => {
    // optimistic update
    setAttempts((prev) => ({ ...prev, [index]: status }));
    try {
      await api.patch(`/api/attempts/${id}/${index}`, { status });
    } catch {
      // revert on failure
      setAttempts((prev) => ({ ...prev, [index]: undefined }));
    }
  };

  if (loading) return <div className="log-line">$ loading question set...</div>;
  if (error) return <div className="error-msg">{error}</div>;
  if (!set) return null;

  return (
    <div className="panel">
      <div className="panel-title">generated questions</div>
      {set.questions.map((q, idx) => {
        const status = attempts[idx];
        return (
          <div className="question-line" key={idx}>
            <span className={`tag tag-${q.category}`}>
              [{TAG_LABEL[q.category]}]
              <span className="difficulty-bar">{DIFFICULTY_BAR[q.difficulty]}</span>
            </span>
            <span className={`question-text ${status === 'answered' ? 'answered' : ''}`}>{q.text}</span>
            <span className="status-btns">
              <button
                className={status === 'answered' ? 'active-answered' : ''}
                onClick={() => markStatus(idx, 'answered')}
              >
                done
              </button>
              <button
                className={status === 'flagged' ? 'active-flagged' : ''}
                onClick={() => markStatus(idx, 'flagged')}
              >
                flag
              </button>
              <button onClick={() => markStatus(idx, 'skipped')}>skip</button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
