import { useState, useEffect } from 'react';
import { Coffee, LayoutDashboard, Instagram, Facebook, Twitter, Sparkles, Image, BookOpen, FileText, Trophy, MessageSquareHeart, Menu, X } from 'lucide-react';
import { Tiktok } from '@/components/icons';

export type ViewId =
  | 'dashboard'
  | 'social'
  | 'ai-ads'
  | 'image-search'
  | 'prompt-library'
  | 'surveys'
  | 'competitions'
  | 'sentiment';

type NavItem = {
  id: ViewId;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'social', label: 'Social Media', icon: <Instagram className="w-5 h-5" /> },
  { id: 'ai-ads', label: 'AI Ad Generator', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'image-search', label: 'AI Image Search', icon: <Image className="w-5 h-5" /> },
  { id: 'prompt-library', label: 'Prompt Library', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'surveys', label: 'Customer Surveys', icon: <FileText className="w-5 h-5" /> },
  { id: 'competitions', label: 'Competitions', icon: <Trophy className="w-5 h-5" /> },
  { id: 'sentiment', label: 'Sentiment Analysis', icon: <MessageSquareHeart className="w-5 h-5" /> },
];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  tiktok: <Tiktok className="w-4 h-4" />,
};

type Props = {
  current: ViewId;
  onNavigate: (view: ViewId) => void;
  children: React.ReactNode;
};

export default function Layout({ current, onNavigate, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [current]);

  const activeItem = NAV_ITEMS.find((n) => n.id === current);

  return (
    <div className="min-h-screen flex bg-coffee-50">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-coffee-900 text-coffee-100 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6 border-b border-coffee-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cream-400 to-coffee-500 flex items-center justify-center flex-shrink-0">
            <Coffee className="w-6 h-6 text-coffee-900" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-display text-xl font-bold text-white leading-none">Brew Haus</h1>
              <p className="text-xs text-coffee-400 mt-0.5">Campaign Studio</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = item.id === current;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active
                    ? 'bg-coffee-700 text-white shadow-lg'
                    : 'text-coffee-300 hover:bg-coffee-800 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="animate-fade-in">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-coffee-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-coffee-400 hover:bg-coffee-800 hover:text-white transition-colors text-sm"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <><X className="w-4 h-4" /> Collapse</>}
          </button>
        </div>
      </aside>

      {/* Mobile Header + Drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-coffee-900 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cream-400 to-coffee-500 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-coffee-900" />
          </div>
          <h1 className="font-display text-lg font-bold">Brew Haus</h1>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-coffee-800 transition-colors">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 animate-fade-in" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-coffee-900 text-coffee-100 p-4 pt-20 overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = item.id === current;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                      active ? 'bg-coffee-700 text-white' : 'text-coffee-300 hover:bg-coffee-800'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:flex items-center gap-2 px-8 py-4 bg-white border-b border-coffee-100">
          <div className="flex items-center gap-2 text-coffee-400">
            {PLATFORM_ICONS.instagram}
            {PLATFORM_ICONS.facebook}
            {PLATFORM_ICONS.twitter}
            {PLATFORM_ICONS.tiktok}
          </div>
          <div className="ml-auto text-sm text-coffee-500">
            {activeItem?.label}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
