import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Heart, Zap, Sparkles, Wand2, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { Project, Recommendation, UserStats } from '../types';
import { AudioPlayer } from '../components/AudioPlayer';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    api.getUserStats().then(setStats).catch(console.error);
    api.getProjects({ limit: '6' }).then((res) => {
      setRecentProjects(res.projects || []);
      if (res.projects?.length > 0) setActiveProject(res.projects[0]);
    }).catch(console.error);
    api.getRecommendations().then((res) => {
      setRecommendations(res.recommendations || []);
      if (res.insights?.message) setInsights(res.insights.message);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-brand-purple/10 via-transparent to-brand-pink/10">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">Music Studio Overview</h1>
          <p className="text-gray-400 text-sm max-w-xl">{insights || 'Generate, edit, analyze and discover personalized musical compositions.'}</p>
        </div>
        <Link
          to="/composer"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold text-sm shadow-lg shadow-brand-purple/25 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          <span>New AI Composition</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats?.totalProjects ?? 0}</div>
            <div className="text-xs text-gray-400 font-medium">Total Compositions</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-pink/20 border border-brand-pink/40 flex items-center justify-center text-brand-pink">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats?.totalFavorites ?? 0}</div>
            <div className="text-xs text-gray-400 font-medium">Saved Favorites</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats?.totalGenerations ?? 0}</div>
            <div className="text-xs text-gray-400 font-medium">AI Generation Runs</div>
          </div>
        </div>
      </div>

      {/* Currently Playing Audio Player Widget */}
      {activeProject && activeProject.audioUrl && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Audio Preview Player</h3>
          <AudioPlayer
            src={activeProject.audioUrl}
            midiUrl={activeProject.midiUrl}
            title={activeProject.title}
            artist={`${activeProject.genre || 'Ambient'} • ${activeProject.bpm || 90} BPM`}
            projectId={activeProject._id}
            isFavorited={activeProject.isFavorited}
          />
        </div>
      )}

      {/* Personalized Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-purple" />
            <h2 className="text-xl font-bold text-white">Recommended For You</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, i) => (
              <div key={i} className="glass-card glass-card-hover p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                    {rec.type}
                  </span>
                  <h4 className="font-bold text-white text-lg">{rec.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{rec.description}</p>
                </div>
                <Link
                  to="/composer"
                  state={rec.suggestion}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-brand-purple/20 text-brand-purple hover:text-white border border-brand-purple/30 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <span>Use Vibe</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Compositions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Recent Projects</h2>
          <Link to="/library" className="text-xs font-semibold text-brand-purple hover:underline">
            View All Projects
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl space-y-3">
            <Music className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">No musical compositions generated yet.</p>
            <Link to="/composer" className="inline-block px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-semibold">
              Create First Track
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recentProjects.map((p) => (
              <div
                key={p._id}
                onClick={() => setActiveProject(p)}
                className={`glass-card glass-card-hover p-5 rounded-2xl cursor-pointer space-y-3 border ${
                  activeProject?._id === p._id ? 'border-brand-purple bg-brand-purple/10' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-brand-pink/20 text-brand-pink border border-brand-pink/30">
                    {p.genre || 'Instrumental'}
                  </span>
                  <span className="text-xs font-mono text-gray-400">{p.bpm ? `${p.bpm} BPM` : ''}</span>
                </div>
                <div>
                  <h4 className="font-bold text-white truncate">{p.title}</h4>
                  <p className="text-xs text-gray-400 line-clamp-1">{p.prompt || 'Custom parameters composition'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
