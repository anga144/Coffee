import { useState, useEffect } from 'react';
import { supabase, type Review } from '@/lib/supabase';
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader, Modal } from '@/components/ui';
import { MessageSquareHeart, Plus, Trash2, Star, TrendingUp, TrendingDown, Minus, Smile, Frown, Meh } from 'lucide-react';

const POSITIVE_WORDS = ['love', 'amazing', 'great', 'excellent', 'perfect', 'best', 'delicious', 'friendly', 'cozy', 'beautiful', 'recommend', 'awesome', 'fantastic', 'wonderful', 'great', 'good', 'nice', 'happy', 'welcoming', 'solid'];
const NEGATIVE_WORDS = ['disappointed', 'bad', 'terrible', 'awful', 'slow', 'rude', 'burnt', 'loud', 'wrong', 'expensive', 'overpriced', 'dirty', 'cold', 'wait', 'annoyed', 'wont', 'worse', 'poor', 'horrible', 'worst'];

function analyzeSentiment(text: string): { score: number; label: 'positive' | 'neutral' | 'negative' } {
  const lower = text.toLowerCase();
  let score = 0;
  POSITIVE_WORDS.forEach((word) => {
    if (lower.includes(word)) score += 0.2;
  });
  NEGATIVE_WORDS.forEach((word) => {
    if (lower.includes(word)) score -= 0.2;
  });
  score = Math.max(-1, Math.min(1, score));
  const label: 'positive' | 'neutral' | 'negative' = score > 0.15 ? 'positive' : score < -0.15 ? 'negative' : 'neutral';
  return { score: Number(score.toFixed(2)), label };
}

const SOURCE_META: Record<string, { color: string; label: string }> = {
  google: { color: 'bg-blue-100 text-blue-700', label: 'Google' },
  yelp: { color: 'bg-red-100 text-red-700', label: 'Yelp' },
  instagram: { color: 'bg-pink-100 text-pink-700', label: 'Instagram' },
  facebook: { color: 'bg-blue-100 text-blue-700', label: 'Facebook' },
  twitter: { color: 'bg-sky-100 text-sky-700', label: 'Twitter' },
  tiktok: { color: 'bg-gray-900 text-white', label: 'TikTok' },
};

export default function SentimentAnalysis() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');

  const [form, setForm] = useState({
    source: 'google' as string,
    author_name: '',
    rating: 5,
    review_text: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    setError('');
    try {
      const { data, error: revError } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (revError) throw revError;
      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.review_text.trim()) return;
    setAdding(true);
    try {
      const { score, label } = analyzeSentiment(form.review_text);
      const { error: insertError } = await supabase.from('reviews').insert({
        source: form.source || null,
        author_name: form.author_name || null,
        rating: form.rating,
        review_text: form.review_text,
        sentiment_score: score,
        sentiment_label: label,
      });
      if (insertError) throw insertError;
      setShowAdd(false);
      setForm({ source: 'google', author_name: '', rating: 5, review_text: '' });
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
    } finally {
      setAdding(false);
    }
  }

  async function reanalyzeReview(review: Review) {
    const { score, label } = analyzeSentiment(review.review_text);
    try {
      const { error: updateError } = await supabase.from('reviews').update({ sentiment_score: score, sentiment_label: label }).eq('id', review.id);
      if (updateError) throw updateError;
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review');
    }
  }

  async function deleteReview(id: string) {
    try {
      const { error: deleteError } = await supabase.from('reviews').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  }

  if (loading) return <LoadingSpinner label="Loading reviews..." />;
  if (error) return <ErrorState message={error} />;

  const positive = reviews.filter((r) => r.sentiment_label === 'positive');
  const neutral = reviews.filter((r) => r.sentiment_label === 'neutral');
  const negative = reviews.filter((r) => r.sentiment_label === 'negative');
  const avgScore = reviews.length > 0 ? (reviews.reduce((s, r) => s + Number(r.sentiment_score), 0) / reviews.length).toFixed(2) : '0';
  const avgRating = reviews.filter((r) => r.rating).length > 0
    ? (reviews.filter((r) => r.rating).reduce((s, r) => s + (r.rating || 0), 0) / reviews.filter((r) => r.rating).length).toFixed(1)
    : '0';

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.sentiment_label === filter);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Sentiment Analysis"
        subtitle="AI-powered analysis of customer reviews across platforms"
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Review
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-forest-100 flex items-center justify-center text-forest-600"><Smile className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-display font-bold text-coffee-900">{positive.length}</p>
              <p className="text-xs text-coffee-500">Positive</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-coffee-100 flex items-center justify-center text-coffee-600"><Meh className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-display font-bold text-coffee-900">{neutral.length}</p>
              <p className="text-xs text-coffee-500">Neutral</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-ember-100 flex items-center justify-center text-ember-600"><Frown className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-display font-bold text-coffee-900">{negative.length}</p>
              <p className="text-xs text-coffee-500">Negative</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-coffee-700 flex items-center justify-center text-white"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-2xl font-display font-bold text-coffee-900">{avgScore}</p>
              <p className="text-xs text-coffee-500">Avg Sentiment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment distribution bar */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-bold text-coffee-900 mb-4">Sentiment Distribution</h3>
        <div className="flex h-8 rounded-xl overflow-hidden">
          {positive.length > 0 && (
            <div className="bg-forest-500 flex items-center justify-center text-white text-xs font-medium transition-all duration-500" style={{ width: `${(positive.length / reviews.length) * 100}%` }}>
              {Math.round((positive.length / reviews.length) * 100)}%
            </div>
          )}
          {neutral.length > 0 && (
            <div className="bg-coffee-300 flex items-center justify-center text-coffee-800 text-xs font-medium transition-all duration-500" style={{ width: `${(neutral.length / reviews.length) * 100}%` }}>
              {Math.round((neutral.length / reviews.length) * 100)}%
            </div>
          )}
          {negative.length > 0 && (
            <div className="bg-ember-500 flex items-center justify-center text-white text-xs font-medium transition-all duration-500" style={{ width: `${(negative.length / reviews.length) * 100}%` }}>
              {Math.round((negative.length / reviews.length) * 100)}%
            </div>
          )}
        </div>
        <div className="flex justify-between mt-3 text-xs text-coffee-500">
          <span>Avg Rating: {avgRating} / 5</span>
          <span>{reviews.length} total reviews</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-coffee-700 text-white' : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50'}`}>
          All ({reviews.length})
        </button>
        <button onClick={() => setFilter('positive')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${filter === 'positive' ? 'bg-forest-600 text-white' : 'bg-white text-forest-600 border border-coffee-200 hover:bg-coffee-50'}`}>
          <TrendingUp className="w-4 h-4" /> Positive ({positive.length})
        </button>
        <button onClick={() => setFilter('neutral')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${filter === 'neutral' ? 'bg-coffee-600 text-white' : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50'}`}>
          <Minus className="w-4 h-4" /> Neutral ({neutral.length})
        </button>
        <button onClick={() => setFilter('negative')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${filter === 'negative' ? 'bg-ember-600 text-white' : 'bg-white text-ember-600 border border-coffee-200 hover:bg-coffee-50'}`}>
          <TrendingDown className="w-4 h-4" /> Negative ({negative.length})
        </button>
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <EmptyState icon={<MessageSquareHeart className="w-8 h-8" />} title="No reviews found" message="Add a review or change the filter" />
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => {
            const sourceMeta = review.source ? SOURCE_META[review.source] || { color: 'bg-coffee-100 text-coffee-600', label: review.source } : null;
            const sentimentColor = review.sentiment_label === 'positive' ? 'text-forest-600 bg-forest-50' : review.sentiment_label === 'negative' ? 'text-ember-600 bg-ember-50' : 'text-coffee-600 bg-coffee-50';
            const SentimentIcon = review.sentiment_label === 'positive' ? Smile : review.sentiment_label === 'negative' ? Frown : Meh;
            return (
              <div key={review.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${sentimentColor}`}>
                      <SentimentIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-coffee-900">{review.author_name || 'Anonymous'}</h4>
                        {sourceMeta && <span className={`badge ${sourceMeta.color}`}>{sourceMeta.label}</span>}
                        <span className={`badge ${sentimentColor} capitalize`}>{review.sentiment_label}</span>
                      </div>
                      {review.rating && (
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating! ? 'fill-amber-400 text-amber-400' : 'text-coffee-200'}`} />
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-coffee-600">{review.review_text}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-coffee-400">Score: {Number(review.sentiment_score).toFixed(2)}</span>
                        <button onClick={() => reanalyzeReview(review)} className="text-xs text-coffee-500 hover:text-coffee-700 transition-colors">Re-analyze</button>
                        <button onClick={() => deleteReview(review.id)} className="text-xs text-ember-500 hover:text-ember-700 transition-colors flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Review Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Customer Review" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">Source</label>
              <select className="input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                <option value="google">Google</option>
                <option value="yelp">Yelp</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">Author Name</label>
              <input className="input" placeholder="Customer name" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setForm({ ...form, rating: s })} className="p-1">
                  <Star className={`w-7 h-7 ${s <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-coffee-200'} hover:scale-110 transition-transform`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Review Text</label>
            <textarea className="input min-h-[120px] resize-y" placeholder="Paste the customer review here..." value={form.review_text} onChange={(e) => setForm({ ...form, review_text: e.target.value })} />
          </div>
          <div className="p-3 bg-coffee-50 rounded-xl text-sm text-coffee-500">
            Sentiment will be automatically analyzed when you add the review.
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAdd} disabled={adding || !form.review_text.trim()} className="btn-primary flex-1">{adding ? 'Adding...' : 'Add Review'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
