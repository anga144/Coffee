import { useState } from 'react';
import Layout, { type ViewId } from '@/components/Layout';
import Dashboard from '@/views/Dashboard';
import SocialMedia from '@/views/SocialMedia';
import AiAdGenerator from '@/views/AiAdGenerator';
import ImageSearch from '@/views/ImageSearch';
import PromptLibrary from '@/views/PromptLibrary';
import Surveys from '@/views/Surveys';
import Competitions from '@/views/Competitions';
import SentimentAnalysis from '@/views/SentimentAnalysis';

export default function App() {
  const [view, setView] = useState<ViewId>('dashboard');

  return (
    <Layout current={view} onNavigate={setView}>
      {view === 'dashboard' && <Dashboard />}
      {view === 'social' && <SocialMedia />}
      {view === 'ai-ads' && <AiAdGenerator />}
      {view === 'image-search' && <ImageSearch />}
      {view === 'prompt-library' && <PromptLibrary />}
      {view === 'surveys' && <Surveys />}
      {view === 'competitions' && <Competitions />}
      {view === 'sentiment' && <SentimentAnalysis />}
    </Layout>
  );
}
