import { useEffect, useState } from 'react';
import { api } from '../../api';
import { Page, Card, Spinner, EmptyState, Modal, useToast, StatusBadge, Badge } from '../../components/ui';
import { BrainCircuit, Play, Award, CheckCircle2 } from 'lucide-react';

export default function StudentQuiz() {
  const [rows, setRows] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const toast = useToast();

  useEffect(() => { api('/student/quizzes').then(setRows).catch(() => {}); }, []);
  if (!rows) return <Spinner />;

  const start = async (q) => {
    if (q.attempt_status === 'COMPLETED') {
      setResult({ score: q.score, totalQuestions: q.question_count });
      setQuestions([]);
      setQuiz(q);
      return;
    }
    setAnswers({});
    setResult(null);
    setQuiz(q);
    setQuestions([]);
    const res = await api(`/student/quizzes/${q.id}/questions`).catch(() => null);
    if (res) setQuestions(res.questions || []);
  };

  const submit = async () => {
    try {
      const r = await api(`/student/quizzes/${quiz.id}/attempt`, { method: 'POST', body: { answers } });
      setResult(r);
      toast.success(`Skor Anda: ${r.score}%`);
      api('/student/quizzes').then(setRows).catch(() => {});
    } catch (e) { toast.error(e.message); }
  };

  return (
    <Page title="Kuis & Asesmen" subtitle="Uji pemahamanmu dengan kuis interaktif.">
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((q) => (
          <Card key={q.id} className="p-5 card-hover">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-violet-100 grid place-items-center text-violet-600"><BrainCircuit size={20} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-slate-900">{q.title}</p>
                  {q.attempt_status ? <StatusBadge status={q.attempt_status} /> : <Badge tone="slate">BELUM</Badge>}
                  {q.score !== null && <Badge tone="green"><Award size={10} /> {q.score}%</Badge>}
                </div>
                <p className="text-sm text-slate-500 mt-1">{q.subject_name}</p>
                <p className="text-[11px] text-slate-400 mt-1">{q.question_count} soal · lolos ≥ {q.passing_score}% · {q.time_limit} menit</p>
                <div className="mt-3">
                  <button className="btn-primary btn-sm" onClick={() => start(q)} disabled={!!q.attempt_status && q.attempt_status !== 'IN_PROGRESS'}>
                    {q.attempt_status === 'COMPLETED' ? 'Lihat Skor' : q.attempt_status === 'IN_PROGRESS' ? 'Lanjutkan' : <><Play size={13} /> Kerjakan</>}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <EmptyState title="Belum ada kuis" />}
      </div>

      <Modal open={!!quiz} onClose={() => setQuiz(null)} title={quiz?.title} size="xl"
        footer={result && <button className="btn-primary btn-sm" onClick={() => setQuiz(null)}>Tutup</button>}>
        {result ? (
          <div className="text-center py-6">
            <div className="h-24 w-24 mx-auto rounded-full grid place-items-center bg-gradient-brand text-white text-3xl font-extrabold">{result.score}%</div>
            <p className="mt-4 text-lg font-extrabold text-slate-900">{result.score >= 80 ? 'Luar biasa!' : result.score >= 60 ? 'Bagus, tingkatkan lagi!' : 'Terus berlatih!'}</p>
            <p className="text-sm text-slate-500 mt-1">{result.score} / 100 · {result.totalQuestions} soal</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600"><CheckCircle2 size={16} /><span className="text-sm font-semibold">Selesai — skor tercatat pada progress Anda.</span></div>
          </div>
        ) : questions.length === 0 ? (
          <Spinner />
        ) : (
          <div className="space-y-5">
            {questions.map((q, i) => (
              <div key={q.id} className="rounded-xl border border-slate-100 p-4">
                <p className="font-bold text-slate-800 mb-3">{i + 1}. {q.question} <span className="ml-1 text-xs text-violet-500 font-semibold">({Array.isArray(q.options) ? q.options.length : 0} pilihan · {q.score} poin)</span></p>
                <div className="space-y-2">
                  {Array.isArray(q.options) && q.options.map((opt, oi) => {
                    const letter = String.fromCharCode(65 + oi);
                    return (
                      <label key={oi} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${answers[q.id] === opt ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-100 hover:border-indigo-200'}`}>
                        <input type="radio" name={`q${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} className="accent-indigo-600" />
                        <span className="text-sm text-slate-700">{letter}. {opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <button className="btn-primary" onClick={submit}>Kumpulkan Jawaban</button>
            </div>
          </div>
        )}
      </Modal>
    </Page>
  );
}