import { useState, useEffect } from 'react';
import { supabase, type PromptLibraryEntry, type GeneratedContent } from '@/lib/supabase';
import { LoadingSpinner, ErrorState, EmptyState, SectionHeader, Modal, Badge } from '@/components/ui';
import { BookOpen, Plus, Code2, FileText, ImageIcon, Trash2, Wand2, Copy, Check, Tag } from 'lucide-react';

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  text: { icon: <FileText className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', label: 'Text' },
  image: { icon: <ImageIcon className="w-4 h-4" />, color: 'bg-forest-100 text-forest-700', label: 'Image' },
  code: { icon: <Code2 className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700', label: 'Code' },
};

// Simulated AI generation templates
const TEXT_GENERATORS: Record<string, () => string> = {
  'Instagram Caption - Study Brew': () => 'study mode: ON iced cold brew + fresh pastry to keep you going show your student ID for 20% off the study bundle let us fuel your finals grind',
  'Facebook Post - Community Event': () => 'Join us this Saturday for our Latte Art Workshop! 10am-12pm at Brew Haus. Learn to pour hearts, rosettas, and tulips with our expert baristas. Free with any drink purchase. Tag your study buddy and come get creative with us!',
  'TikTok Script - Study POV': () => '[HOOK: Student walks into coffee shop, tired] Text overlay: "POV: you found the perfect study spot" [CUT: Iced caramel latte being made] Text: "this is your sign to try Brew Haus" [CUT: Cozy seating area with lo-fi music] Text: "study vibes = unlocked" [END: Student smiling with coffee] Text: "20% off with student ID!"',
  'Twitter Thread - Coffee Facts': () => '1/ Did you know caffeine blocks adenosine receptors in your brain, keeping you alert? Perfect for study sessions.\n\n2/ A single espresso shot has about 63mg of caffeine. A cold brew? Up to 200mg. Choose your fighter.\n\n3/ Coffee can improve memory consolidation by up to 15%. Study + coffee = a power move.\n\n4/ The ideal study coffee break is every 90 minutes. Your brain works in cycles, not marathons.\n\n5/ Want to try it yourself? Students get 20% off study bundles at Brew Haus this month. Show your student ID!',
  'Ad Headline Generator': () => '1. Brew Bold, Study Harder\n2. Your Coffee, Your Vibe\n3. Fuel Your Hustle\n4. Sip. Study. Succeed.\n5. Wake Up to Better',
};

const CODE_GENERATORS: Record<string, () => string> = {
  'Email Newsletter Template': () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:#825634;padding:40px 30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Brew Haus Monthly</h1>
      <p style="color:#e8d5b8;margin:8px 0 0;">Your coffee update, fresh off the press</p>
    </div>
    <div style="padding:30px;">
      <h2 style="color:#5e3f28;">Featured This Month</h2>
      <p style="color:#825634;line-height:1.6;">Try our new Maple Pecan Latte, available all September!</p>
      <a href="#" style="display:inline-block;background:#a06b3e;color:#fff;padding:12px 30px;border-radius:30px;text-decoration:none;margin-top:16px;">Order Now</a>
    </div>
    <div style="padding:0 30px 30px;">
      <h2 style="color:#5e3f28;">Upcoming Events</h2>
      <ul style="color:#825634;line-height:1.8;">
        <li>Latte Art Workshop - Sept 14, 10am</li>
        <li>Study Night Live - Every Thursday 6-10pm</li>
        <li>Open Mic Fridays - Every Friday 7pm</li>
      </ul>
    </div>
    <div style="background:#3d2a1c;padding:20px 30px;text-align:center;">
      <p style="color:#e8d5b8;margin:0;font-size:13px;">Brew Haus Coffee | 123 Campus Street</p>
      <p style="color:#c89e6a;margin:8px 0 0;font-size:12px;">Follow us @brewhaus on all platforms</p>
    </div>
  </div>
</body>
</html>`,
  'Landing Page Component': () => `export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold text-amber-900">
          Brew Brighter
        </h1>
        <p className="mt-4 text-lg text-amber-700">
          Your study spot, perfected.
        </p>
        <button className="mt-8 px-8 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition">
          Order Now
        </button>
      </div>
    </section>
  );
}`,
  'Social Media Scheduler API': () => `type Platform = 'instagram' | 'facebook' | 'twitter' | 'tiktok';

interface Post {
  id: string;
  platform: Platform;
  content: string;
  imageUrl?: string;
  scheduledAt: Date;
}

interface ScheduleResult {
  success: boolean;
  postId: string;
  scheduledAt: Date;
  error?: string;
}

async function schedulePost(post: Omit<Post, 'id'>): Promise<ScheduleResult> {
  try {
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!response.ok) {
      throw new Error(\`Scheduling failed: \${response.status}\`);
    }
    const result = await response.json();
    return { success: true, ...result };
  } catch (error) {
    return {
      success: false,
      postId: '',
      scheduledAt: post.scheduledAt,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}`,
  'React Hook Form Validator': () => `import { useState, useCallback } from 'react';

type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
};

type ValidationSchema = Record<string, ValidationRule>;

export function useFormValidator<T extends Record<string, string>>(schema: ValidationSchema) {
  const [values, setValues] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validate = useCallback((field: string, value: string): string => {
    const rule = schema[field];
    if (!rule) return '';
    if (rule.required && !value) return rule.message || 'This field is required';
    if (rule.minLength && value.length < rule.minLength)
      return rule.message || \`Must be at least \${rule.minLength} characters\`;
    if (rule.maxLength && value.length > rule.maxLength)
      return rule.message || \`Must be at most \${rule.maxLength} characters\`;
    if (rule.pattern && !rule.pattern.test(value))
      return rule.message || 'Invalid format';
    return '';
  }, [schema]);

  const handleChange = useCallback((field: keyof T, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validate(field as string, value) }));
    }
  }, [touched, validate]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = (values[field] || '') as string;
    setErrors((prev) => ({ ...prev, [field]: validate(field as string, value) }));
  }, [values, validate]);

  const isFormValid = useCallback(() => {
    return Object.keys(schema).every((field) => validate(field, (values[field] || '') as string) === '');
  }, [schema, values, validate]);

  return { values, errors, touched, handleChange, handleBlur, isFormValid };
}`,
  'SQL Query Builder': () => `type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

interface QueryBuilderOptions {
  type: QueryType;
  table: string;
  columns?: string[];
  values?: Record<string, unknown>;
  where?: Record<string, unknown>;
  orderBy?: string;
  limit?: number;
}

export function buildQuery(options: QueryBuilderOptions): { query: string; params: unknown[] } {
  const params: unknown[] = [];
  let query = '';

  switch (options.type) {
    case 'SELECT': {
      const cols = options.columns?.join(', ') || '*';
      query = \`SELECT \${cols} FROM \${options.table}\`;
      if (options.where) {
        const clauses = Object.entries(options.where).map(([key, val]) => {
          params.push(val);
          return \`\${key} = $\${params.length}\`;
        });
        query += \` WHERE \${clauses.join(' AND ')}\`;
      }
      if (options.orderBy) query += \` ORDER BY \${options.orderBy}\`;
      if (options.limit) { query += \` LIMIT $\${params.length + 1}\`; params.push(options.limit); }
      break;
    }
    case 'INSERT': {
      if (!options.values) throw new Error('INSERT requires values');
      const entries = Object.entries(options.values);
      const cols = entries.map(([k]) => k).join(', ');
      const placeholders = entries.map((_, i) => \`$\${i + 1}\`).join(', ');
      entries.forEach(([, v]) => params.push(v));
      query = \`INSERT INTO \${options.table} (\${cols}) VALUES (\${placeholders}) RETURNING *\`;
      break;
    }
    case 'UPDATE': {
      if (!options.values || !options.where) throw new Error('UPDATE requires values and where');
      const setEntries = Object.entries(options.values);
      const setClauses = setEntries.map(([key, val]) => {
        params.push(val);
        return \`\${key} = $\${params.length}\`;
      });
      query = \`UPDATE \${options.table} SET \${setClauses.join(', ')}\`;
      const whereClauses = Object.entries(options.where).map(([key, val]) => {
        params.push(val);
        return \`\${key} = $\${params.length}\`;
      });
      query += \` WHERE \${whereClauses.join(' AND ')} RETURNING *\`;
      break;
    }
    case 'DELETE': {
      if (!options.where) throw new Error('DELETE requires where');
      const whereClauses = Object.entries(options.where).map(([key, val]) => {
        params.push(val);
        return \`\${key} = $\${params.length}\`;
      });
      query = \`DELETE FROM \${options.table} WHERE \${whereClauses.join(' AND ')} RETURNING *\`;
      break;
    }
  }
  return { query, params };
}`,
  'REST API Express Server': () => `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface Item {
  id: string;
  name: string;
  description?: string;
}

const items: Map<string, Item> = new Map();

app.get('/api/items', (req, res) => {
  res.json(Array.from(items.values()));
});

app.get('/api/items/:id', (req, res) => {
  const item = items.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const id = crypto.randomUUID();
  const item: Item = { id, name, description };
  items.set(id, item);
  res.status(201).json(item);
});

app.put('/api/items/:id', (req, res) => {
  const item = items.get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const { name, description } = req.body;
  if (name) item.name = name;
  if (description !== undefined) item.description = description;
  items.set(item.id, item);
  res.json(item);
});

app.delete('/api/items/:id', (req, res) => {
  if (!items.has(req.params.id))
    return res.status(404).json({ error: 'Item not found' });
  items.delete(req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
  'Tailwind CSS Card Component': () => `interface CardProps {
  title: string;
  description: string;
  imageUrl?: string;
  badge?: string;
  onClick?: () => void;
}

export function Card({ title, description, imageUrl, badge, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      {imageUrl && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {badge && (
            <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}`,
  'JWT Authentication Middleware': () => `import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, SECRET_KEY, { expiresIn: '24h' });
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.userId = decoded.userId;
  req.userRole = decoded.role;
  next();
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}`,
  'Chart Data Formatter': () => `export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartDataset {
  name: string;
  data: ChartDataPoint[];
}

export function formatBarChartData(
  raw: Record<string, number>[],
  labelKey: string,
  valueKey: string
): ChartDataPoint[] {
  return raw.map((item) => ({
    label: String(item[labelKey] || ''),
    value: Number(item[valueKey] || 0),
  }));
}

export function formatPieChartData(
  raw: Record<string, number>[],
  labelKey: string,
  valueKey: string,
  colors: string[]
): ChartDataPoint[] {
  return raw.map((item, index) => ({
    label: String(item[labelKey] || ''),
    value: Number(item[valueKey] || 0),
    color: colors[index % colors.length],
  }));
}

export function formatTimeSeriesData(
  raw: { date: string; value: number }[],
  interval: 'day' | 'week' | 'month' = 'day'
): ChartDataPoint[] {
  const grouped = new Map<string, number>();
  for (const point of raw) {
    const date = new Date(point.date);
    let key: string;
    if (interval === 'month') {
      key = date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
    } else if (interval === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    } else {
      key = date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    }
    grouped.set(key, (grouped.get(key) || 0) + point.value);
  }
  return Array.from(grouped.entries()).map(([label, value]) => ({ label, value }));
}

export function calculateTrend(data: ChartDataPoint[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const diff = last - first;
  const threshold = first * 0.05;
  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
}`,
};

export default function PromptLibrary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prompts, setPrompts] = useState<PromptLibraryEntry[]>([]);
  const [generated, setGenerated] = useState<GeneratedContent[]>([]);
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'code'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    prompt_text: '',
    category: 'text' as PromptLibraryEntry['category'],
    tags: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [promptRes, genRes] = await Promise.all([
        supabase.from('prompt_library').select('*').order('created_at', { ascending: false }),
        supabase.from('generated_content').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      if (promptRes.error) throw promptRes.error;
      if (genRes.error) throw genRes.error;
      setPrompts(promptRes.data || []);
      setGenerated(genRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.title.trim() || !form.prompt_text.trim()) return;
    setCreating(true);
    try {
      const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const { error: insertError } = await supabase.from('prompt_library').insert({
        title: form.title,
        prompt_text: form.prompt_text,
        category: form.category,
        tags,
      });
      if (insertError) throw insertError;
      setShowCreate(false);
      setForm({ title: '', prompt_text: '', category: 'text', tags: '' });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
    } finally {
      setCreating(false);
    }
  }

  async function generateContent(prompt: PromptLibraryEntry) {
    setGenerating(prompt.id);
    let generatedText = '';

    if (prompt.category === 'text' && TEXT_GENERATORS[prompt.title]) {
      generatedText = TEXT_GENERATORS[prompt.title]();
    } else if (prompt.category === 'code' && CODE_GENERATORS[prompt.title]) {
      generatedText = CODE_GENERATORS[prompt.title]();
    } else if (prompt.category === 'image') {
      // For image prompts, show the prompt as a ready-to-use image generation prompt
      generatedText = `[Image Prompt Ready]\n\n${prompt.prompt_text}\n\nUse this prompt in your AI image generation tool to create the visual content.`;
    } else {
      // Generic fallback
      generatedText = `Generated content for: ${prompt.title}\n\n${prompt.prompt_text}`;
    }

    try {
      const { error: insertError } = await supabase.from('generated_content').insert({
        prompt_id: prompt.id,
        content_type: prompt.category,
        prompt_used: prompt.prompt_text,
        generated_text: generatedText,
      });
      if (insertError) throw insertError;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save generated content');
    } finally {
      setGenerating(null);
    }
  }

  async function deletePrompt(id: string) {
    try {
      const { error: deleteError } = await supabase.from('prompt_library').delete().eq('id', id);
      if (deleteError) throw deleteError;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) return <LoadingSpinner label="Loading prompt library..." />;
  if (error) return <ErrorState message={error} />;

  const filteredPrompts = filter === 'all' ? prompts : prompts.filter((p) => p.category === filter);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Prompt Library"
        subtitle="Reusable AI prompts for text, image, and code generation"
        action={
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Prompt
          </button>
        }
      />

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === 'all' ? 'bg-coffee-700 text-white' : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50'}`}
        >
          All ({prompts.length})
        </button>
        {(['text', 'image', 'code'] as const).map((cat) => {
          const meta = CATEGORY_META[cat];
          const count = prompts.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${filter === cat ? 'bg-coffee-700 text-white' : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-50'}`}
            >
              {meta.icon} {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Prompts grid */}
      {filteredPrompts.length === 0 ? (
        <EmptyState icon={<BookOpen className="w-8 h-8" />} title="No prompts yet" message="Create your first reusable prompt" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrompts.map((prompt) => {
            const meta = CATEGORY_META[prompt.category];
            return (
              <div key={prompt.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${meta.color} flex items-center gap-1.5`}>{meta.icon} {meta.label}</span>
                    <h3 className="font-semibold text-coffee-900">{prompt.title}</h3>
                  </div>
                  <button onClick={() => deletePrompt(prompt.id)} className="text-coffee-300 hover:text-ember-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-coffee-600 line-clamp-3 mb-3">{prompt.prompt_text}</p>
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {prompt.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs text-coffee-400 bg-coffee-50 px-2 py-0.5 rounded-md">
                        <Tag className="w-2.5 h-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => generateContent(prompt)}
                  disabled={generating === prompt.id}
                  className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <Wand2 className={`w-4 h-4 ${generating === prompt.id ? 'animate-spin' : ''}`} />
                  {generating === prompt.id ? 'Generating...' : 'Generate Content'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Recently Generated */}
      {generated.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-coffee-900">Recently Generated</h3>
          <div className="space-y-3">
            {generated.map((content) => {
              const meta = CATEGORY_META[content.content_type] || CATEGORY_META.text;
              return (
                <div key={content.id} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${meta.color} flex items-center gap-1.5`}>{meta.icon} {meta.label}</span>
                      <span className="text-xs text-coffee-400">{new Date(content.created_at).toLocaleDateString()}</span>
                    </div>
                    <button onClick={() => copyToClipboard(content.generated_text || '', content.id)} className="text-coffee-400 hover:text-coffee-700 transition-colors">
                      {copiedId === content.id ? <Check className="w-4 h-4 text-forest-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="text-sm text-coffee-700 whitespace-pre-wrap font-mono bg-coffee-50 p-4 rounded-xl overflow-x-auto max-h-60 overflow-y-auto">{content.generated_text}</pre>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Prompt Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Prompt" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Title</label>
            <input className="input" placeholder="e.g. Instagram Caption - Holiday Special" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(['text', 'image', 'code'] as const).map((cat) => {
                const meta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${form.category === cat ? 'border-coffee-500 bg-coffee-50' : 'border-coffee-200 hover:border-coffee-300'}`}
                  >
                    {meta.icon}
                    <span className="text-xs font-medium">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Prompt Text</label>
            <textarea className="input min-h-[120px] resize-y" placeholder="Write your prompt..." value={form.prompt_text} onChange={(e) => setForm({ ...form, prompt_text: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1.5">Tags (comma-separated)</label>
            <input className="input" placeholder="instagram, caption, students" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={creating || !form.title.trim() || !form.prompt_text.trim()} className="btn-primary flex-1">{creating ? 'Creating...' : 'Create Prompt'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
