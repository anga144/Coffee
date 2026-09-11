import { useState, useEffect } from 'react';
import { supabase, type Survey, type SurveyQuestion, type SurveyResponse, type SurveyAnswer, type Campaign } from '@/lib/supabase';
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader, Modal, Badge } from '@/components/ui';
import { FileText, Plus, Trash2, Star, ChevronRight, Users, BarChart3 } from 'lucide-react';

export default function Surveys() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    campaign_id: '',
  });

  useEffect(() => {
    loadSurveys();
  }, []);

  async function loadSurveys() {
    setLoading(true);
    setError('');
    try {
      const [survRes, campRes] = await Promise.all([
        supabase.from('surveys').select('*').order('created_at', { ascending: false }),
        supabase.from('campaigns').select('*').order('name'),
      ]);
      if (survRes.error) throw survRes.error;
      if (campRes.error) throw campRes.error;
      setSurveys(survRes.data || []);
      setCampaigns(campRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  }

  async function selectSurvey(survey: Survey) {
    setSelectedSurvey(survey);
    try {
      const [qRes, rRes] = await Promise.all([
        supabase.from('survey_questions').select('*').eq('survey_id', survey.id).order('display_order'),
        supabase.from('survey_responses').select('*').eq('survey_id', survey.id).order('submitted_at', { ascending: false }),
      ]);
      if (qRes.error) throw qRes.error;
      if (rRes.error) throw rRes.error;
      setQuestions(qRes.data || []);
      setResponses(rRes.data || []);
      if (rRes.data && rRes.data.length > 0) {
        const responseIds = rRes.data.map((r) => r.id);
        const aRes = await supabase.from('survey_answers').select('*').in('response_id', responseIds);
        if (aRes.error) throw aRes.error;
        setAnswers(aRes.data || []);
      } else {
        setAnswers([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey details');
    }
  }

  async function handleCreate() {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const { data, error: insertError } = await supabase
        .from('surveys')
        .insert({
          title: form.title,
          description: form.description || null,
          campaign_id: form.campaign_id || null,
          is_active: true,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      setShowCreate(false);
      setForm({ title: '', description: '', campaign_id: '' });
      await loadSurveys();
      if (data) selectSurvey(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create survey');
    } finally {
      setCreating(false);
    }
  }

  async function deleteSurvey(id: string) {
    try {
      const { error: deleteError } = await supabase.from('surveys').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setSelectedSurvey(null);
      await loadSurveys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete survey');
    }
  }

  if (loading) return <LoadingSpinner label="Loading surveys..." />;
  if (error) return <ErrorState message={error} />;

  // Survey detail view
  if (selectedSurvey) {
    const campaign = campaigns.find((c) => c.id === selectedSurvey.campaign_id);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedSurvey(null)} className="btn-ghost flex items-center gap-1 text-sm">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Surveys
          </button>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-display text-2xl font-bold text-coffee-900">{selectedSurvey.title}</h2>
                <Badge status={selectedSurvey.is_active ? 'active' : 'paused'} />
              </div>
              {selectedSurvey.description && <p className="text-coffee-500 text-sm">{selectedSurvey.description}</p>}
              {campaign && <p className="text-xs text-coffee-400 mt-2">Campaign: {campaign.name}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-coffee-500"><Users className="w-4 h-4" /> {responses.length} responses</div>
              <button onClick={() => deleteSurvey(selectedSurvey.id)} className="text-ember-600 hover:bg-ember-50 px-3 py-2 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Questions with results */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-coffee-900 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Survey Results</h3>
          {questions.length === 0 ? (
            <EmptyState icon={<FileText className="w-8 h-8" />} title="No questions" message="This survey has no questions yet" />
          ) : (
            questions.map((q, idx) => {
              const questionAnswers = answers.filter((a) => a.question_id === q.id);
              return (
                <div key={q.id} className="card p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-coffee-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{idx + 1}</div>
                    <h4 className="font-semibold text-coffee-900">{q.question_text}</h4>
                  </div>
                  <QuestionResults question={q} answers={questionAnswers} />
                </div>
              );
            })
          )}
        </div>

        {/* Recent responses */}
        {responses.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-coffee-900">Recent Responses</h3>
            {responses.slice(0, 5).map((resp) => {
              const respAnswers = answers.filter((a) => a.response_id === resp.id);
              return (
                <div key={resp.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-coffee-800 text-sm">{resp.respondent_name || 'Anonymous'}</span>
                    <span className="text-xs text-coffee-400">{new Date(resp.submitted_at).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1.5">
                    {respAnswers.map((ans) => {
                      const q = questions.find((qq) => qq.id === ans.question_id);
                      return (
                        <div key={ans.id} className="text-sm flex gap-2">
                          <span className="text-coffee-400 flex-shrink-0">{q?.question_text.slice(0, 30)}...:</span>
                          <span className="text-coffee-700">
                            {ans.answer_rating ? `${'★'.repeat(ans.answer_rating)}${'☆'.repeat(5 - ans.answer_rating)}` : ans.selected_option || ans.answer_text || '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Survey list view
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Customer Surveys"
        subtitle="Create and manage customer feedback surveys"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Survey
          </button>
        }
      />

      {surveys.length === 0 ? (
        <EmptyState icon={<FileText className="w-8 h-8" />} title="No surveys yet" message="Create your first customer survey" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {surveys.map((survey) => {
            const campaign = campaigns.find((c) => c.id === survey.campaign_id);
            return (
              <button
                key={survey.id}
                onClick={() => selectSurvey(survey)}
                className="card p-5 text-left hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-coffee-100 flex items-center justify-center text-coffee-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge status={survey.is_active ? 'active' : 'paused'} />
                </div>
                <h3 className="font-display text-lg font-bold text-coffee-900 group-hover:text-coffee-700 transition-colors">{survey.title}</h3>
                {survey.description && <p className="text-sm text-coffee-500 mt-1 line-clamp-2">{survey.description}</p>}
                {campaign && <p className="text-xs text-coffee-400 mt-3">Campaign: {campaign.name}</p>}
                <div className="flex items-center gap-1 text-sm text-coffee-400 mt-3 group-hover:text-coffee-700 transition-colors">
                  View details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Survey">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Title</label>
            <input className="input" placeholder="e.g. Customer Satisfaction Survey" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Description</label>
            <textarea className="input min-h-[80px] resize-y" placeholder="Survey description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Campaign (optional)</label>
            <select className="input" value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}>
              <option value="">No campaign</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={creating || !form.title.trim()} className="btn-primary flex-1">{creating ? 'Creating...' : 'Create Survey'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function QuestionResults({ question, answers }: { question: SurveyQuestion; answers: SurveyAnswer[] }) {
  if (question.question_type === 'rating') {
    const ratings = answers.map((a) => a.answer_rating).filter((r): r is number => r !== null);
    const avg = ratings.length > 0 ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : '0';
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: ratings.filter((r) => r === star).length,
    }));
    const maxCount = Math.max(...distribution.map((d) => d.count), 1);
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(Number(avg)) ? 'fill-amber-400 text-amber-400' : 'text-coffee-200'}`} />
            ))}
          </div>
          <span className="text-lg font-bold text-coffee-900">{avg}</span>
          <span className="text-sm text-coffee-400">({ratings.length} ratings)</span>
        </div>
        <div className="space-y-1.5">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2">
              <span className="text-xs text-coffee-500 w-8">{d.star} star</span>
              <div className="flex-1 h-4 bg-coffee-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${(d.count / maxCount) * 100}%` }} />
              </div>
              <span className="text-xs text-coffee-500 w-6 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (question.question_type === 'multiple_choice' && question.options) {
    const counts = question.options.map((opt) => ({
      option: opt,
      count: answers.filter((a) => a.selected_option === opt).length,
    }));
    const maxCount = Math.max(...counts.map((c) => c.count), 1);
    return (
      <div className="space-y-2">
        {counts.map((c) => (
          <div key={c.option}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-coffee-700">{c.option}</span>
              <span className="text-sm font-medium text-coffee-500">{c.count}</span>
            </div>
            <div className="h-3 bg-coffee-100 rounded-full overflow-hidden">
              <div className="h-full bg-coffee-500 rounded-full transition-all duration-500" style={{ width: `${(c.count / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Text answers
  const textAnswers = answers.filter((a) => a.answer_text).map((a) => a.answer_text);
  if (textAnswers.length === 0) {
    return <p className="text-sm text-coffee-400 italic">No responses yet</p>;
  }
  return (
    <div className="space-y-2">
      {textAnswers.map((text, idx) => (
        <div key={idx} className="text-sm text-coffee-700 bg-coffee-50 p-3 rounded-lg">"{text}"</div>
      ))}
    </div>
  );
}
