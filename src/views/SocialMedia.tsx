import { useState, useEffect } from 'react';
import { supabase, type SocialPost, type Campaign } from '@/lib/supabase';
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader, Modal, Badge } from '@/components/ui';
import { Instagram, Facebook, Twitter, Plus, Heart, MessageCircle, Share2, Eye, Calendar, ImageIcon, ExternalLink } from 'lucide-react';
import { Tiktok } from '@/components/icons';

const PLATFORM_META: Record<string, { icon: React.ReactNode; color: string; label: string; url: string }> = {
  instagram: { icon: <Instagram className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700', label: 'Instagram', url: 'https://www.instagram.com' },
  facebook: { icon: <Facebook className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', label: 'Facebook', url: 'https://www.facebook.com' },
  twitter: { icon: <Twitter className="w-4 h-4" />, color: 'bg-sky-100 text-sky-700', label: 'Twitter', url: 'https://www.twitter.com' },
  tiktok: { icon: <Tiktok className="w-4 h-4" />, color: 'bg-gray-900 text-white', label: 'TikTok', url: 'https://www.tiktok.com' },
};

type Filter = 'all' | 'instagram' | 'facebook' | 'twitter' | 'tiktok';

export default function SocialMedia() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    campaign_id: '',
    platform: 'instagram' as SocialPost['platform'],
    content: '',
    image_url: '',
    status: 'draft' as SocialPost['status'],
    scheduled_at: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [postRes, campRes] = await Promise.all([
        supabase.from('social_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('campaigns').select('*').order('name'),
      ]);
      if (postRes.error) throw postRes.error;
      if (campRes.error) throw campRes.error;
      setPosts(postRes.data || []);
      setCampaigns(campRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.content.trim()) return;
    setCreating(true);
    try {
      const insertData: Record<string, unknown> = {
        campaign_id: form.campaign_id || null,
        platform: form.platform,
        content: form.content,
        image_url: form.image_url || null,
        status: form.status,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      };
      const { error: insertError } = await supabase.from('social_posts').insert(insertData);
      if (insertError) throw insertError;
      setShowCreate(false);
      setForm({ campaign_id: '', platform: 'instagram', content: '', image_url: '', status: 'draft', scheduled_at: '' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setCreating(false);
    }
  }

  async function updatePostStatus(id: string, status: SocialPost['status']) {
    try {
      const updateData: Record<string, unknown> = { status };
      if (status === 'published') updateData.published_at = new Date().toISOString();
      const { error: updateError } = await supabase.from('social_posts').update(updateData).eq('id', id);
      if (updateError) throw updateError;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
    }
  }

  async function deletePost(id: string) {
    try {
      const { error: deleteError } = await supabase.from('social_posts').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  }

  if (loading) return <LoadingSpinner label="Loading social posts..." />;
  if (error) return <ErrorState message={error} />;

  const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.platform === filter);
  const platformCounts = ['instagram', 'facebook', 'twitter', 'tiktok'].map((p) => ({
    platform: p,
    count: posts.filter((post) => post.platform === p).length,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Social Media"
        subtitle="Manage posts across Instagram, Facebook, Twitter, and TikTok"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Post
          </button>
        }
      />

      {/* Platform links bar */}
      <div className="card p-4">
        <p className="text-xs text-coffee-500 font-medium mb-3">Visit your social platforms:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['instagram', 'facebook', 'twitter', 'tiktok'] as const).map((p) => {
            const meta = PLATFORM_META[p];
            return (
              <a
                key={p}
                href={meta.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-coffee-200 hover:border-coffee-400 hover:bg-coffee-50 transition-all group ${meta.color}`}
              >
                {meta.icon}
                <span className="text-sm font-medium flex-1">{meta.label}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Platform filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-coffee-700 text-white' : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50'}`}
        >
          All ({posts.length})
        </button>
        {platformCounts.map(({ platform, count }) => {
          const meta = PLATFORM_META[platform];
          const active = filter === platform;
          return (
            <button
              key={platform}
              onClick={() => setFilter(platform as Filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${active ? 'bg-coffee-700 text-white' : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50'}`}
            >
              {meta.icon} {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Posts grid */}
      {filteredPosts.length === 0 ? (
        <EmptyState icon={<Instagram className="w-8 h-8" />} title="No posts yet" message="Create your first social media post to get started" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPosts.map((post) => {
            const meta = PLATFORM_META[post.platform];
            const campaign = campaigns.find((c) => c.id === post.campaign_id);
            return (
              <div key={post.id} className="card overflow-hidden hover:shadow-md transition-shadow group">
                {post.image_url && (
                  <div className="aspect-video bg-coffee-100 overflow-hidden">
                    <img src={post.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`badge ${meta.color} flex items-center gap-1.5`}>{meta.icon} {meta.label}</span>
                    <Badge status={post.status} />
                  </div>
                  <p className="text-sm text-coffee-700 line-clamp-3 mb-3">{post.content}</p>
                  {campaign && <p className="text-xs text-coffee-400 mb-3">Campaign: {campaign.name}</p>}
                  {post.status === 'published' && (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs text-coffee-500 mb-3 pt-3 border-t border-coffee-100">
                      <div><Heart className="w-4 h-4 mx-auto text-ember-500 mb-0.5" /><span className="font-semibold text-coffee-700">{post.likes}</span></div>
                      <div><MessageCircle className="w-4 h-4 mx-auto text-coffee-500 mb-0.5" /><span className="font-semibold text-coffee-700">{post.comments}</span></div>
                      <div><Share2 className="w-4 h-4 mx-auto text-forest-500 mb-0.5" /><span className="font-semibold text-coffee-700">{post.shares}</span></div>
                      <div><Eye className="w-4 h-4 mx-auto text-coffee-500 mb-0.5" /><span className="font-semibold text-coffee-700">{post.reach.toLocaleString()}</span></div>
                    </div>
                  )}
                  {post.scheduled_at && post.status === 'scheduled' && (
                    <p className="text-xs text-blue-600 flex items-center gap-1 mb-3"><Calendar className="w-3 h-3" /> Scheduled: {new Date(post.scheduled_at).toLocaleDateString()}</p>
                  )}
                  <div className="flex gap-2">
                    {post.status === 'draft' && (
                      <button onClick={() => updatePostStatus(post.id, 'scheduled')} className="flex-1 text-xs btn-secondary py-2">Schedule</button>
                    )}
                    {post.status === 'scheduled' && (
                      <button onClick={() => updatePostStatus(post.id, 'published')} className="flex-1 text-xs btn-primary py-2">Publish</button>
                    )}
                    <a
                      href={meta.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-xs px-3 py-2 bg-coffee-100 text-coffee-700 rounded-xl hover:bg-coffee-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3 h-3" /> Open {meta.label}
                    </a>
                    <button onClick={() => deletePost(post.id)} className="text-xs px-3 py-2 text-ember-600 hover:bg-ember-50 rounded-xl transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Social Post" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {(['instagram', 'facebook', 'twitter', 'tiktok'] as const).map((p) => {
                const meta = PLATFORM_META[p];
                return (
                  <button
                    key={p}
                    onClick={() => setForm({ ...form, platform: p })}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${form.platform === p ? 'border-coffee-500 bg-coffee-50' : 'border-coffee-200 hover:border-coffee-300'}`}
                  >
                    {meta.icon}
                    <span className="text-xs font-medium">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Campaign</label>
            <select className="input" value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}>
              <option value="">No campaign</option>
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Content</label>
            <textarea className="input min-h-[100px] resize-y" placeholder="Write your post content..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Image URL (optional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
              <input className="input pl-10" placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SocialPost['status'] })}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">Schedule Date</label>
              <input type="datetime-local" className="input" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={creating || !form.content.trim()} className="btn-primary flex-1">{creating ? 'Creating...' : 'Create Post'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
