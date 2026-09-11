import { useState, useEffect } from 'react';
import { supabase, type Competition, type CompetitionEntry, type Campaign } from '@/lib/supabase';
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader, Modal, Badge } from '@/components/ui';
import { Trophy, Plus, Trash2, ChevronRight, Users, Gift, Calendar, Award, Mail } from 'lucide-react';

export default function Competitions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selected, setSelected] = useState<Competition | null>(null);
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    prize: '',
    rules: '',
    campaign_id: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadCompetitions();
  }, []);

  async function loadCompetitions() {
    setLoading(true);
    setError('');
    try {
      const [compRes, campRes] = await Promise.all([
        supabase.from('competitions').select('*').order('created_at', { ascending: false }),
        supabase.from('campaigns').select('*').order('name'),
      ]);
      if (compRes.error) throw compRes.error;
      if (campRes.error) throw campRes.error;
      setCompetitions(compRes.data || []);
      setCampaigns(campRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitions');
    } finally {
      setLoading(false);
    }
  }

  async function selectCompetition(comp: Competition) {
    setSelected(comp);
    try {
      const eRes = await supabase.from('competition_entries').select('*').eq('competition_id', comp.id).order('submitted_at', { ascending: false });
      if (eRes.error) throw eRes.error;
      setEntries(eRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    }
  }

  async function handleCreate() {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const { data, error: insertError } = await supabase
        .from('competitions')
        .insert({
          title: form.title,
          description: form.description || null,
          prize: form.prize || null,
          rules: form.rules || null,
          campaign_id: form.campaign_id || null,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          status: 'active',
          entry_count: 0,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      setShowCreate(false);
      setForm({ title: '', description: '', prize: '', rules: '', campaign_id: '', start_date: '', end_date: '' });
      await loadCompetitions();
      if (data) selectCompetition(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create competition');
    } finally {
      setCreating(false);
    }
  }

  async function deleteCompetition(id: string) {
    try {
      const { error: deleteError } = await supabase.from('competitions').delete().eq('id', id);
      if (deleteError) throw deleteError;
      setSelected(null);
      await loadCompetitions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete competition');
    }
  }

  async function deleteEntry(id: string) {
    try {
      const { error: deleteError } = await supabase.from('competition_entries').delete().eq('id', id);
      if (deleteError) throw deleteError;
      if (selected) {
        const { error: updateError } = await supabase
          .from('competitions')
          .update({ entry_count: Math.max(0, selected.entry_count - 1) })
          .eq('id', selected.id);
        if (updateError) throw updateError;
        selectCompetition({ ...selected, entry_count: Math.max(0, selected.entry_count - 1) });
        await loadCompetitions();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    }
  }

  if (loading) return <LoadingSpinner label="Loading competitions..." />;
  if (error) return <ErrorState message={error} />;

  // Competition detail view
  if (selected) {
    const campaign = campaigns.find((c) => c.id === selected.campaign_id);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelected(null)} className="btn-ghost flex items-center gap-1 text-sm">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Competitions
          </button>
        </div>

        <div className="card p-6 bg-gradient-to-br from-coffee-50 to-cream-50">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-coffee-600 flex items-center justify-center text-white flex-shrink-0">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-display text-2xl font-bold text-coffee-900">{selected.title}</h2>
                  <Badge status={selected.status} />
                </div>
                {selected.description && <p className="text-coffee-600 text-sm max-w-2xl">{selected.description}</p>}
              </div>
            </div>
            <button onClick={() => deleteCompetition(selected.id)} className="text-ember-600 hover:bg-ember-50 px-3 py-2 rounded-xl transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 text-coffee-500 mb-1"><Gift className="w-4 h-4" /><span className="text-xs font-medium">Prize</span></div>
              <p className="text-sm font-semibold text-coffee-800">{selected.prize || 'Not specified'}</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 text-coffee-500 mb-1"><Calendar className="w-4 h-4" /><span className="text-xs font-medium">Duration</span></div>
              <p className="text-sm font-semibold text-coffee-800">{selected.start_date || 'TBD'} - {selected.end_date || 'TBD'}</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 text-coffee-500 mb-1"><Users className="w-4 h-4" /><span className="text-xs font-medium">Entries</span></div>
              <p className="text-sm font-semibold text-coffee-800">{selected.entry_count} participants</p>
            </div>
          </div>

          {selected.rules && (
            <div className="mt-4 bg-white rounded-xl p-4">
              <h4 className="text-sm font-semibold text-coffee-700 mb-2">Rules</h4>
              <p className="text-sm text-coffee-600 whitespace-pre-line">{selected.rules}</p>
            </div>
          )}
          {campaign && <p className="text-xs text-coffee-400 mt-4">Campaign: {campaign.name}</p>}
        </div>

        {/* Entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-coffee-900 flex items-center gap-2">
              <Award className="w-5 h-5" /> Entries ({entries.length})
            </h3>
          </div>
          {entries.length === 0 ? (
            <EmptyState icon={<Users className="w-8 h-8" />} title="No entries yet" message="Entries will appear here when participants submit" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entries.map((entry, idx) => (
                <div key={entry.id} className="card p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-coffee-100 flex items-center justify-center text-coffee-600 font-bold text-sm flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-coffee-900 text-sm">{entry.entrant_name}</h4>
                      <button onClick={() => deleteEntry(entry.id)} className="text-coffee-300 hover:text-ember-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {entry.entrant_email && (
                      <p className="text-xs text-coffee-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {entry.entrant_email}</p>
                    )}
                    {entry.entry_note && <p className="text-sm text-coffee-600 mt-2 italic">"{entry.entry_note}"</p>}
                    <p className="text-xs text-coffee-300 mt-2">{new Date(entry.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Competition list view
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Promotional Competitions"
        subtitle="Run contests and giveaways to engage your audience"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Competition
          </button>
        }
      />

      {competitions.length === 0 ? (
        <EmptyState icon={<Trophy className="w-8 h-8" />} title="No competitions yet" message="Create your first promotional competition" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitions.map((comp) => {
            const campaign = campaigns.find((c) => c.id === comp.campaign_id);
            return (
              <button
                key={comp.id}
                onClick={() => selectCompetition(comp)}
                className="card p-5 text-left hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-coffee-600 flex items-center justify-center text-white">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <Badge status={comp.status} />
                </div>
                <h3 className="font-display text-lg font-bold text-coffee-900 group-hover:text-coffee-700 transition-colors">{comp.title}</h3>
                {comp.description && <p className="text-sm text-coffee-500 mt-1 line-clamp-2">{comp.description}</p>}
                <div className="flex items-center gap-4 mt-4 text-xs text-coffee-400">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {comp.entry_count} entries</span>
                  {comp.prize && <span className="flex items-center gap-1"><Gift className="w-3.5 h-3.5" /> Prize set</span>}
                  {campaign && <span>{campaign.name}</span>}
                </div>
                <div className="flex items-center gap-1 text-sm text-coffee-400 mt-3 group-hover:text-coffee-700 transition-colors">
                  View details <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Competition" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Title</label>
            <input className="input" placeholder="e.g. Holiday Latte Art Contest" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Description</label>
            <textarea className="input min-h-[80px] resize-y" placeholder="Competition description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Prize</label>
            <input className="input" placeholder="e.g. 1 month of free coffee" value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Rules</label>
            <textarea className="input min-h-[100px] resize-y" placeholder="1. Follow us on Instagram&#10;2. Post your photo...&#10;3. Tag us" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Campaign (optional)</label>
            <select className="input" value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}>
              <option value="">No campaign</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">Start Date</label>
              <input type="date" className="input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">End Date</label>
              <input type="date" className="input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={creating || !form.title.trim()} className="btn-primary flex-1">{creating ? 'Creating...' : 'Create Competition'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
