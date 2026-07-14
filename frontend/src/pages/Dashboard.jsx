import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [companyName, setCompanyName] = useState('');
  const [rawText, setRawText] = useState('');
  const [jds, setJds] = useState([]);
  const [progress, setProgress] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    const [jdRes, dashRes] = await Promise.all([
      api.get('/api/jd'),
      api.get('/api/dashboard')
    ]);
    setJds(jdRes.data);
    setProgress(dashRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data: jd } = await api.post('/api/jd', { companyName, rawText });
      const { data: questionSet } = await api.post(`/api/jd/${jd._id}/generate`);
      setCompanyName('');
      setRawText('');
      await loadData();
      navigate(`/sets/${questionSet._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate questions. Check your Gemini API key / quota.');
    } finally {
      setSubmitting(false);
    }
  };

  const progressForJd = (jdId) => progress.find((p) => String(p.questionSetId) && jds.find((j) => j._id === jdId));

  return (
    <div>
      <div className="panel">
        <div className="panel-title">new job description</div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>company</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. TCS, Infosys, a startup name"
              required
            />
          </div>
          <div className="field">
            <label>job description text</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="paste the full JD here..."
              required
            />
          </div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'generating questions...' : 'generate questions'}
          </button>
          {error && <div className="error-msg">{error}</div>}
        </form>
      </div>

      <div className="panel">
        <div className="panel-title">your prep sessions</div>
        {progress.length === 0 && <div className="empty-state">no sessions yet. paste a JD above to generate one.</div>}
        {progress.map((p) => (
          <div className="jd-row" key={p.questionSetId}>
            <div>
              <div className="jd-company">{p.companyName}</div>
              <div className="jd-meta">{p.progressPercent}% answered</div>
              <div className="progress-track" style={{ width: 160 }}>
                <div className="progress-fill" style={{ width: `${p.progressPercent}%` }} />
              </div>
            </div>
            <Link className="btn" to={`/sets/${p.questionSetId}`}>open</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
