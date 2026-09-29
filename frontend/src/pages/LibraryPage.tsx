import React, { useEffect, useState } from 'react';
import { FileMusic, Search, Trash2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';
import { AudioPlayer } from '../components/AudioPlayer';

export const LibraryPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loadProjects = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (selectedGenre) params.genre = selectedGenre.toLowerCase();

    api.getProjects(params)
      .then((res) => setProjects(res.projects || []))
      .catch(console.error);
  };

  useEffect(() => {
    loadProjects();
  }, [search, selectedGenre]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      if (selectedProject?._id === id) setSelectedProject(null);
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleVariation = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.createVariation({ projectId, variationType: 'more_energetic' });
      alert('Variation generation started! Check Dashboard or refresh Library shortly.');
    } catch (err: any) {
      alert(err.message || 'Variation failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <FileMusic className="w-8 h-8 text-brand-purple" />
            <span>Music Library</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage, search, preview, and export your AI generated compositions.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search compositions by title, mood, or prompt..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple text-sm"
          />
        </div>

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-dark-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-purple"
        >
          <option value="">All Genres</option>
          <option value="cinematic">Cinematic</option>
          <option value="lo-fi">Lo-Fi</option>
          <option value="ambient">Ambient</option>
          <option value="classical">Classical</option>
          <option value="pop">Pop</option>
          <option value="rock">Rock</option>
        </select>
      </div>

      {/* Audio Player for Selected Item */}
      {selectedProject && selectedProject.audioUrl && (
        <AudioPlayer
          src={selectedProject.audioUrl}
          midiUrl={selectedProject.midiUrl}
          title={selectedProject.title}
          artist={`${selectedProject.genre || 'Ambient'} • ${selectedProject.bpm || 90} BPM`}
          projectId={selectedProject._id}
          isFavorited={selectedProject.isFavorited}
        />
      )}

      {/* Grid of Projects */}
      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl text-gray-400">
          No projects found in your library.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => setSelectedProject(project)}
              className={`glass-card glass-card-hover p-6 rounded-2xl cursor-pointer space-y-4 border ${
                selectedProject?._id === project._id ? 'border-brand-purple bg-brand-purple/10' : 'border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
                  {project.genre || 'Instrumental'}
                </span>
                <span className="text-xs font-mono text-gray-400">{project.duration}s</span>
              </div>

              <div>
                <h4 className="font-bold text-white text-lg truncate">{project.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{project.prompt || 'Custom composition parameters'}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <button
                  onClick={(e) => handleVariation(project._id, e)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-brand-pink/20 text-brand-pink border border-brand-pink/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Variation</span>
                </button>

                <button
                  onClick={(e) => handleDelete(project._id, e)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
