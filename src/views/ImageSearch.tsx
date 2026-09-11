import { useState, useEffect } from 'react';
import { supabase, type ImageLibraryEntry, type SearchHistoryEntry } from '@/lib/supabase';
import { SectionHeader, LoadingSpinner } from '@/components/ui';
import { Search, ImageIcon, Sparkles, ExternalLink, History, X } from 'lucide-react';

const CATEGORIES = [
  'coffee', 'nature', 'technology', 'food', 'fashion', 'travel',
  'fitness', 'music', 'animals', 'city', 'art', 'health', 'education', 'flowers',
];

const SUGGESTED_QUERIES = [
  'coffee latte art',
  'mountain landscape',
  'office technology',
  'restaurant food',
  'fashion clothing',
  'tropical beach',
  'gym workout',
  'concert music',
  'cute animals',
  'city architecture',
  'abstract art',
  'spa wellness',
  'study books',
  'garden flowers',
];

export default function ImageSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageLibraryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const { data } = await supabase
        .from('search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      setHistory(data || []);
    } catch {
      // silently ignore - history is non-critical
    }
  }

  async function saveHistory(searchQuery: string, count: number) {
    try {
      await supabase.from('search_history').insert({
        query: searchQuery,
        results_count: count,
      });
      await loadHistory();
    } catch {
      // silently ignore
    }
  }

  async function deleteHistory(id: string) {
    try {
      await supabase.from('search_history').delete().eq('id', id);
      setHistory(history.filter((h) => h.id !== id));
    } catch {
      // silently ignore
    }
  }

  async function clearAllHistory() {
    try {
      await supabase.from('search_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      setHistory([]);
    } catch {
      // silently ignore
    }
  }

  async function searchImages(searchQuery?: string, category?: string) {
    const q = (searchQuery || query).trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setHasSearched(true);

    await new Promise((r) => setTimeout(r, 400));

    const lowerQ = q.toLowerCase();
    const matchedCategories = CATEGORIES.filter((c) => lowerQ.includes(c));

    try {
      let dbQuery = supabase.from('image_library').select('*');

      const cat = category || selectedCategory;
      if (cat !== 'all') {
        dbQuery = dbQuery.eq('category', cat);
      } else if (matchedCategories.length > 0) {
        dbQuery = dbQuery.in('category', matchedCategories);
      }

      const { data, error } = await dbQuery.order('created_at', { ascending: false });
      if (error) throw error;

      let filtered = data || [];

      if (cat === 'all' && matchedCategories.length === 0) {
        filtered = filtered.filter(
          (img) =>
            (img.alt_text || '').toLowerCase().includes(lowerQ) ||
            (img.photographer || '').toLowerCase().includes(lowerQ) ||
            img.category.toLowerCase().includes(lowerQ)
        );
      }

      const seed = q.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const shuffled = [...filtered].sort((a, b) => {
        return ((a.id.charCodeAt(0) + seed) % 2) - ((b.id.charCodeAt(0) + seed) % 2);
      });

      setResults(shuffled);
      await saveHistory(q, shuffled.length);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function browseCategory(category: string) {
    setSelectedCategory(category);
    setQuery(category);
    setHasSearched(true);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 300));

    try {
      const { data, error } = await supabase
        .from('image_library')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
      await saveHistory(category, (data || []).length);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI Image Search"
        subtitle="Search for high-quality stock photos across any topic — coffee, nature, tech, fashion, travel, and more"
        action={
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary flex items-center gap-2"
          >
            <History className="w-4 h-4" /> History ({history.length})
          </button>
        }
      />

      {/* Search bar */}
      <div className="card p-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-coffee-400" />
            <input
              className="input pl-12"
              placeholder="Search for any image — coffee, mountains, fashion, fitness..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchImages()}
            />
          </div>
          <button onClick={() => searchImages()} disabled={loading || !query.trim()} className="btn-primary flex items-center gap-2">
            <Search className="w-4 h-4" /> Search
          </button>
        </div>

        {/* Suggested queries */}
        <div className="mt-4">
          <p className="text-xs text-coffee-500 font-medium mb-2">Try these searches:</p>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setSelectedCategory('all');
                  searchImages(q);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Category browse */}
        <div className="mt-4 pt-4 border-t border-coffee-100">
          <p className="text-xs text-coffee-500 font-medium mb-2">Or browse by category:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedCategory === 'all' ? 'bg-coffee-700 text-white' : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'}`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => browseCategory(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${selectedCategory === c ? 'bg-coffee-700 text-white' : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search History Panel */}
      {showHistory && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-bold text-coffee-900 flex items-center gap-2">
              <History className="w-5 h-5 text-coffee-500" /> Search History
            </h3>
            {history.length > 0 && (
              <button onClick={clearAllHistory} className="text-xs text-ember-600 hover:text-ember-700 font-medium">
                Clear All
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-coffee-400">No search history yet. Your searches will appear here.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between bg-coffee-50 rounded-lg px-3 py-2 group">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      searchImages(h.query);
                    }}
                    className="flex items-center gap-2 text-sm text-coffee-700 hover:text-coffee-900 flex-1 text-left"
                  >
                    <Search className="w-3.5 h-3.5 text-coffee-400" />
                    <span className="font-medium">{h.query}</span>
                    <span className="text-xs text-coffee-400">{h.results_count} results</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-coffee-400">{new Date(h.created_at).toLocaleDateString()} {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => deleteHistory(h.id)}
                      className="text-coffee-300 hover:text-ember-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingSpinner label="Searching for images..." />
      ) : hasSearched && results.length === 0 ? (
        <div className="card p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-coffee-300 mb-3" />
          <h3 className="font-display text-lg font-semibold text-coffee-800">No images found</h3>
          <p className="text-coffee-500 text-sm mt-1">Try a different search term or browse by category</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="flex items-center gap-2 text-sm text-coffee-500">
            <Sparkles className="w-4 h-4 text-coffee-400" />
            <span>{results.length} images found for "{query}"</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((img) => (
              <div key={img.id} className="card overflow-hidden group">
                <div className="aspect-square bg-coffee-100 overflow-hidden relative">
                  <img src={img.thumb_url} alt={img.alt_text || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a href={img.image_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-white/90 rounded-lg text-xs font-medium text-coffee-800 flex items-center gap-1.5 hover:bg-white transition-colors">
                      <ExternalLink className="w-3 h-3" /> View Full
                    </a>
                  </div>
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-md capitalize opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.category}
                  </span>
                </div>
                <div className="p-2.5 flex items-center justify-between">
                  <p className="text-xs text-coffee-400 truncate">by {img.photographer || 'Unknown'}</p>
                  <span className="text-xs text-coffee-300">Pexels</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-coffee-100 flex items-center justify-center mx-auto mb-4 text-coffee-400">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-semibold text-coffee-800">Search for images</h3>
          <p className="text-coffee-500 text-sm mt-1">Enter a search term, try a suggestion, or browse by category above</p>
        </div>
      )}
    </div>
  );
}
