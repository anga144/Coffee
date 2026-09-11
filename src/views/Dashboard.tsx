import { useState, useEffect } from 'react';
import { supabase, type Campaign, type SocialPost, type Review, type Competition } from '@/lib/supabase';
import { LoadingSpinner, ErrorState, StatCard, SectionHeader, Badge } from '@/components/ui';
import { TrendingUp, Heart, Eye, Users, Trophy, MessageCircle, Share2, Calendar } from 'lucide-react';

type PlatformStats = {
  platform: string;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [campRes, postRes, revRes, compRes] = await Promise.all([
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('social_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('competitions').select('*').order('created_at', { ascending: false }),
      ]);
      if (campRes.error) throw campRes.error;
      if (postRes.error) throw postRes.error;
      if (revRes.error) throw revRes.error;
      if (compRes.error) throw compRes.error;
      setCampaigns(campRes.data || []);
      setPosts(postRes.data || []);
      setReviews(revRes.data || []);
      setCompetitions(compRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading campaign performance..." />;
  if (error) return <ErrorState message={error} />;

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const totalReach = publishedPosts.reduce((sum, p) => sum + p.reach, 0);
  const totalLikes = publishedPosts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = publishedPosts.reduce((sum, p) => sum + p.comments, 0);
  const totalShares = publishedPosts.reduce((sum, p) => sum + p.shares, 0);
  const totalEngagement = totalLikes + totalComments + totalShares;
  const engagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : '0';

  const platformStats: PlatformStats[] = ['instagram', 'facebook', 'twitter', 'tiktok'].map((platform) => {
    const platformPosts = publishedPosts.filter((p) => p.platform === platform);
    return {
      platform,
      posts: platformPosts.length,
      likes: platformPosts.reduce((s, p) => s + p.likes, 0),
      comments: platformPosts.reduce((s, p) => s + p.comments, 0),
      shares: platformPosts.reduce((s, p) => s + p.shares, 0),
      reach: platformPosts.reduce((s, p) => s + p.reach, 0),
    };
  });

  const maxReach = Math.max(...platformStats.map((p) => p.reach), 1);

  const positiveReviews = reviews.filter((r) => r.sentiment_label === 'positive').length;
  const negativeReviews = reviews.filter((r) => r.sentiment_label === 'negative').length;
  const neutralReviews = reviews.filter((r) => r.sentiment_label === 'neutral').length;
  const avgSentiment = reviews.length > 0
    ? (reviews.reduce((s, r) => s + Number(r.sentiment_score), 0) / reviews.length).toFixed(2)
    : '0';

  const totalEntries = competitions.reduce((s, c) => s + c.entry_count, 0);

  return (
    <div className="space-y-8">
      <SectionHeader title="Campaign Dashboard" subtitle="Performance overview across all channels and campaigns" />

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reach" value={totalReach.toLocaleString()} icon={<Eye className="w-5 h-5" />} trend="12% vs last month" trendUp />
        <StatCard label="Total Engagement" value={totalEngagement.toLocaleString()} icon={<Heart className="w-5 h-5" />} trend="8% vs last month" trendUp />
        <StatCard label="Engagement Rate" value={`${engagementRate}%`} icon={<TrendingUp className="w-5 h-5" />} trend="0.3% improvement" trendUp />
        <StatCard label="Competition Entries" value={totalEntries} icon={<Users className="w-5 h-5" />} trend="23 new this week" trendUp />
      </div>

      {/* Platform Performance Bar Chart */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-bold text-coffee-900 mb-1">Reach by Platform</h3>
        <p className="text-coffee-500 text-sm mb-6">Total audience reach across social channels</p>
        <div className="space-y-4">
          {platformStats.map((stat) => (
            <div key={stat.platform}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-coffee-700 capitalize">{stat.platform}</span>
                <span className="text-sm text-coffee-500">{stat.reach.toLocaleString()} reach</span>
              </div>
              <div className="h-3 bg-coffee-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-coffee-500 to-coffee-700 transition-all duration-700 ease-out"
                  style={{ width: `${(stat.reach / maxReach) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Breakdown */}
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold text-coffee-900 mb-1">Engagement Breakdown</h3>
          <p className="text-coffee-500 text-sm mb-6">Likes, comments, and shares across all platforms</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-coffee-50 rounded-xl">
              <Heart className="w-7 h-7 mx-auto text-ember-500 mb-2" />
              <p className="text-xl font-display font-bold text-coffee-900">{totalLikes.toLocaleString()}</p>
              <p className="text-xs text-coffee-500 mt-0.5">Likes</p>
            </div>
            <div className="text-center p-4 bg-coffee-50 rounded-xl">
              <MessageCircle className="w-7 h-7 mx-auto text-coffee-500 mb-2" />
              <p className="text-xl font-display font-bold text-coffee-900">{totalComments.toLocaleString()}</p>
              <p className="text-xs text-coffee-500 mt-0.5">Comments</p>
            </div>
            <div className="text-center p-4 bg-coffee-50 rounded-xl">
              <Share2 className="w-7 h-7 mx-auto text-forest-500 mb-2" />
              <p className="text-xl font-display font-bold text-coffee-900">{totalShares.toLocaleString()}</p>
              <p className="text-xs text-coffee-500 mt-0.5">Shares</p>
            </div>
          </div>
        </div>

        {/* Sentiment Overview */}
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold text-coffee-900 mb-1">Sentiment Overview</h3>
          <p className="text-coffee-500 text-sm mb-6">Customer review sentiment analysis</p>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex-shrink-0">
              <DonutChart positive={positiveReviews} neutral={neutralReviews} negative={negativeReviews} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-forest-500"></span> Positive</span>
                <span className="text-sm font-bold text-coffee-800">{positiveReviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-coffee-300"></span> Neutral</span>
                <span className="text-sm font-bold text-coffee-800">{neutralReviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-ember-500"></span> Negative</span>
                <span className="text-sm font-bold text-coffee-800">{negativeReviews}</span>
              </div>
              <div className="pt-2 border-t border-coffee-100">
                <span className="text-sm text-coffee-500">Avg Score: </span>
                <span className="text-sm font-bold text-coffee-800">{avgSentiment}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-bold text-coffee-900 mb-1">Active Campaigns</h3>
        <p className="text-coffee-500 text-sm mb-6">Current marketing campaigns and their status</p>
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const campaignPosts = publishedPosts.filter((p) => p.campaign_id === campaign.id);
            const campaignReach = campaignPosts.reduce((s, p) => s + p.reach, 0);
            return (
              <div key={campaign.id} className="flex items-center gap-4 p-4 bg-coffee-50 rounded-xl hover:bg-coffee-100 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coffee-500 to-coffee-700 flex items-center justify-center text-white flex-shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-coffee-900 truncate">{campaign.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-coffee-500 mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {campaign.start_date || 'TBD'}</span>
                    <span>{campaignPosts.length} posts</span>
                    <span>{campaignReach.toLocaleString()} reach</span>
                  </div>
                </div>
                <Badge status={campaign.status} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DonutChart({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  const total = positive + neutral + negative || 1;
  const posPct = (positive / total) * 100;
  const neuPct = (neutral / total) * 100;
  const negPct = (negative / total) * 100;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#f5ecde" strokeWidth="16" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="16" strokeDasharray={`${(posPct / 100) * 251.2} 251.2`} strokeLinecap="round" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#d9bd93" strokeWidth="16" strokeDasharray={`${(neuPct / 100) * 251.2} 251.2`} strokeDashoffset={`-${(posPct / 100) * 251.2}`} strokeLinecap="round" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray={`${(negPct / 100) * 251.2} 251.2`} strokeDashoffset={`-${((posPct + neuPct) / 100) * 251.2}`} strokeLinecap="round" />
    </svg>
  );
}
