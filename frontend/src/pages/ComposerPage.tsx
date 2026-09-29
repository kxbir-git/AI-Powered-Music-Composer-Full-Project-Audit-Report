import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wand2, Sliders, Sparkles, Music, Play, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { AudioPlayer } from '../components/AudioPlayer';

const GENRES = ['Classical', 'Lo-Fi', 'Pop', 'Rock', 'Jazz', 'Electronic', 'Hip-Hop', 'Cinematic', 'Ambient', 'Folk'];
const MOODS = ['Happy', 'Sad', 'Relaxed', 'Energetic', 'Romantic', 'Dark', 'Peaceful', 'Inspirational', 'Mysterious'];
const INSTRUMENTS = ['Piano', 'Guitar', 'Violin', 'Cello', 'Flute', 'Synth', 'Bass', 'Drums', 'Strings', 'Percussion'];
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES = ['major', 'minor', 'pentatonic', 'blues', 'dorian'];

export const ComposerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilled = location.state || {};

  const [prompt, setPrompt] = useState(prefilled.prompt || '');
  const [genre, setGenre] = useState(prefilled.genre || 'Cinematic');
  const [mood, setMood] = useState(prefilled.mood || 'Inspirational');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(prefilled.instruments || ['Piano', 'Strings']);
  const [bpm, setBpm] = useState(prefilled.bpm || 90);
  const [key, setKey] = useState('C');
  const [scale, setScale] = useState('major');
  const [duration, setDuration] = useState(30);
  const [advancedMode, setAdvancedMode] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [generatedProject, setGeneratedProject] = useState<any | null>(null);

  const toggleInstrument = (inst: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst]
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setProgressMsg('Analyzing text prompt and music theory constraints...');
    setGeneratedProject(null);

    try {
      const payload = {
        prompt,
        genre: genre.toLowerCase(),
        mood: mood.toLowerCase(),
        instruments: selectedInstruments.map((i) => i.toLowerCase()),
        bpm: Number(bpm),
        key,
        scale,
        duration: Number(duration),
        advancedMode,
      };

      const res = await api.generateMusic(payload);
      const genId = res.id;

      // Poll status until completion
      let status = 'pending';
      let pollCount = 0;

      while (status !== 'completed' && status !== 'failed' && pollCount < 30) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        pollCount++;
        setProgressMsg(
          pollCount > 4
            ? 'Synthesizing multi-track procedural audio & rendering WAV...'
            : 'Generating chord progressions & melody arrangements...'
        );

        const statusRes = await api.getGenerationStatus(genId);
        status = statusRes.status;

        if (status === 'completed' && statusRes.project) {
          setGeneratedProject(statusRes.project);
          break;
        }
      }
    } catch (err: any) {
      alert(err.message || 'Music generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Wand2 className="w-8 h-8 text-brand-purple" />
            <span>AI Music Generator</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Create studio-quality compositions using Generative AI and music theory rules.</p>
        </div>

        <button
          onClick={() => setAdvancedMode(!advancedMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            advancedMode
              ? 'bg-brand-purple/20 text-brand-purple border-brand-purple'
              : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Advanced Mode: {advancedMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Main Composer Box */}
      <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
        {/* Natural Language Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-pink" />
            Natural Language Prompt
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Create a relaxing cinematic piano track for studying, around 2 minutes long..."
            className="w-full p-4 rounded-2xl bg-dark-900/80 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-purple text-sm leading-relaxed"
          />
        </div>

        {/* Quick Vibe Options (Genre & Mood) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full p-3 rounded-xl bg-dark-900/80 border border-white/10 text-white focus:outline-none focus:border-brand-purple text-sm"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full p-3 rounded-xl bg-dark-900/80 border border-white/10 text-white focus:outline-none focus:border-brand-purple text-sm"
            >
              {MOODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Instrument Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Target Instruments</label>
          <div className="flex flex-wrap gap-2">
            {INSTRUMENTS.map((inst) => {
              const active = selectedInstruments.includes(inst);
              return (
                <button
                  key={inst}
                  type="button"
                  onClick={() => toggleInstrument(inst)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-md shadow-brand-purple/20'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {inst}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Mode Controls */}
        {advancedMode && (
          <div className="p-6 rounded-2xl bg-dark-900/50 border border-brand-purple/20 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-purple">Harmonic & Rhythm Controls</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">BPM (Tempo)</label>
                <input
                  type="number"
                  min={50}
                  max={200}
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Key</label>
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-sm"
                >
                  {KEYS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Scale</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-sm capitalize"
                >
                  {SCALES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Duration (seconds)</label>
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan text-white font-extrabold text-lg hover:opacity-95 transition-opacity flex items-center justify-center gap-3 shadow-xl shadow-brand-purple/25"
        >
          {generating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>{progressMsg}</span>
            </>
          ) : (
            <>
              <Wand2 className="w-6 h-6" />
              <span>Generate Musical Composition</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Audio Result */}
      {generatedProject && generatedProject.audioUrl && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Composition Successfully Generated!</span>
          </div>

          <AudioPlayer
            src={generatedProject.audioUrl}
            midiUrl={generatedProject.midiUrl}
            title={generatedProject.title}
            artist={`${generatedProject.genre} • ${generatedProject.bpm} BPM • Key of ${generatedProject.key || 'C'} ${generatedProject.scale || 'major'}`}
            projectId={generatedProject._id}
          />
        </div>
      )}
    </div>
  );
};
