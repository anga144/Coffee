import { useState, useEffect } from 'react';
import { supabase, type AiAdvertisement, type Campaign } from '@/lib/supabase';
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader, Modal, Badge } from '@/components/ui';
import { Sparkles, Plus, Wand2, Check, Trash2, Megaphone } from 'lucide-react';

const STYLES = ['Vibrant & Energetic', 'Cozy & Minimalist', 'Playful & Bold', 'Warm & Inviting', 'Modern & Clean', 'Retro & Nostalgic'];
const AUDIENCES = ['College students 18-24', 'Young adults 18-25', 'Coffee enthusiasts 20-30', 'Young professionals 22-30', 'Gen Z 16-22', 'Students & freelancers'];

const AD_TEMPLATES = [
  { headline: 'Brew Brighter This Semester', body: 'Students get 20% off study bundles all month. Cold brew, espresso, and pastries made for marathon study sessions.', cta: 'Show your student ID today' },
  { headline: 'Your Study Spot Just Got Better', body: 'Free WiFi, lo-fi beats, and the best cold brew on campus. Come for the coffee, stay for the vibes.', cta: 'Find your seat' },
  { headline: 'Can You Pour the Perfect Rosetta?', body: 'Enter our Latte Art Contest for a chance to win a month of free coffee. No experience needed, just creativity!', cta: 'Enter now' },
  { headline: 'Wake Up to Better Coffee', body: 'Locally roasted beans, expertly crafted drinks, and a community that gets it. Your new daily ritual starts here.', cta: 'Visit us today' },
  { headline: 'Fuel Your Hustle', body: 'From early morning espresso to late-night cold brew, we have got the fuel for whatever you are grinding on.', cta: 'Grab your brew' },
  { headline: 'Sip. Study. Succeed.', body: 'The perfect study environment: great coffee, comfortable seating, fast WiFi, and a playlist that actually helps you focus.', cta: 'Come study with us' },
];

export default function AiAdGenerator() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ads, setAds] = useState<AiAdvertisement[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [form, setForm] = useState({
    campaign_id: '',
    headline: '',
    body_text: '',
    call_to_action: '',
    image_url: '',
    style: STYLES[0],
    target_audience: AUDIENCES[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [adRes, campRes] = await Promise.all([
        supabase.from('ai_advertisements').select('*').order('created_at', { ascending: false }),
        supabase.from('campaigns').select('*').order('name'),
      ]);
      if (adRes.error) throw adRes.error;
      if (campRes.error) throw campRes.error;
      setAds(adRes.data || []);
      setCampaigns(campRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ads');
    } finally {
      setLoading(false);
    }
  }

  function generateAd() {
    setGenerating(true);
    setTimeout(() => {
      const template = AD_TEMPLATES[Math.floor(Math.random() * AD_TEMPLATES.length)];
      setForm({
        ...form,
        headline: template.headline,
        body_text: template.body,
        call_to_action: template.cta,
      });
      setGenerating(false);
    }, 800);
  }

  async function handleCreate() {
    if (!form.headline.trim()) return;
    setCreating(true);
    try {
      const { error: insertError } = await supabase.from('ai_advertisements').insert({
        campaign_id: form.campaign_id || null,
        headline: form.headline,
        body_text: form.body_text || null,
        call_to_action: form.call_to_action || null,
        image_url: form.image_url || null,
        style: form.style,
        target_audience: form.target_audience,
        status: 'draft',
      });
      if (insertError) throw insertError;
      setShowCreate(false);
      setForm({ campaign_id: '', headline: '', body_text: '', call_to_action: '', image_url: '', style: STYLES[0], target_audience: AUDIENCES[0] });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ad');
    } finally {
      setCreating(false);
    }
  }

  async function updateAdStatus(id: string, status: AiAdvertisement['status']) {
    try {
      const { error: updateError } = await supabase.from('ai_advertisements').update({ status }).eq('id', id);
      if (updateError) throw updateError;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ad');
    }
  }

  async function deleteAd(id: string) {
    try {
      const { error: deleteError } = await supabase.from('ai_advertisements').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ad');
    }
  }

  if (loading) return <LoadingSpinner label="Loading AI advertisements..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Ad Generator"
        subtitle="Create AI-generated advertisements for your campaigns"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Ad
          </button>
        }
      />

      {ads.length === 0 ? (
        <EmptyState icon={<Megaphone className="w-8 h-8" />} title="No ads yet" message="Generate your first AI advertisement" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map((ad) => {
            const campaign = campaigns.find((c) => c.id === ad.campaign_id);
            return (
              <div key={ad.id} className="card overflow-hidden hover:shadow-md transition-shadow group">
                {ad.image_url && (
                  <div className="aspect-video bg-coffee-100 overflow-hidden relative">
                    <img src={ad.image_url} alt={ad.headline} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3"><Badge status={ad.status} /></div>
                  </div>
                )}
                <div className="p-5">
                  {!ad.image_url && <div className="flex items-center justify-between mb-3"><Badge status={ad.status} /></div>}
                  <h3 className="font-display text-lg font-bold text-coffee-900 mb-2">{ad.headline}</h3>
                  <p className="text-sm text-coffee-600 mb-3">{ad.body_text}</p>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {ad.style && <span className="badge bg-cream-100 text-coffee-700">{ad.style}</span>}
                    {ad.target_audience && <span className="badge bg-coffee-100 text-coffee-600">{ad.target_audience}</span>}
                  </div>
                  {ad.call_to_action && (
                    <div className="px-3 py-2 bg-coffee-50 rounded-lg text-sm font-medium text-coffee-700 mb-3">CTA: {ad.call_to_action}</div>
                  )}
                  {campaign && <p className="text-xs text-coffee-400 mb-3">Campaign: {campaign.name}</p>}
                  <div className="flex gap-2 pt-3 border-t border-coffee-100">
                    {ad.status === 'draft' && (
                      <button onClick={() => updateAdStatus(ad.id, 'approved')} className="flex-1 text-xs btn-secondary py-2 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Approve</button>
                    )}
                    {ad.status === 'approved' && (
                      <button onClick={() => updateAdStatus(ad.id, 'published')} className="flex-1 text-xs btn-primary py-2">Publish</button>
                    )}
                    <button onClick={() => deleteAd(ad.id)} className="text-xs px-3 py-2 text-ember-600 hover:bg-ember-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Generate AI Advertisement" size="lg">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-coffee-100 to-cream-100 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-coffee-700 flex items-center justify-center text-white"><Sparkles className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-coffee-800">AI-Powered Ad Generation</p>
              <p className="text-xs text-coffee-500">Click generate to create ad copy, or write your own</p>
            </div>
            <button onClick={generateAd} disabled={generating} className="btn-secondary flex items-center gap-2 text-sm">
              <Wand2 className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Campaign</label>
            <select className="input" value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}>
              <option value="">No campaign</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Headline</label>
            <input className="input" placeholder="Enter ad headline..." value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Body Text</label>
            <textarea className="input min-h-[80px] resize-y" placeholder="Enter ad body text..." value={form.body_text} onChange={(e) => setForm({ ...form, body_text: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Call to Action</label>
            <input className="input" placeholder="e.g. Visit us today" value={form.call_to_action} onChange={(e) => setForm({ ...form, call_to_action: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Image URL (optional)</label>
            <input className="input" placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">Style</label>
              <select className="input" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
                {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">Target Audience</label>
              <select className="input" value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })}>
                {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={creating || !form.headline.trim()} className="btn-primary flex-1">{creating ? 'Creating...' : 'Create Ad'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
