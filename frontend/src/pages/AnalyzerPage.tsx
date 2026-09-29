import React, { useState } from 'react';
import { Activity, Upload, Loader2, Music, Zap, Clock, Disc } from 'lucide-react';
import { api } from '../services/api';
import { MusicAnalysis } from '../types';

export const AnalyzerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MusicAnalysis | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const res = await api.analyzeAudio(file);
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Audio analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-brand-purple" />
          <span>AI Audio Analyzer</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Upload any MP3/WAV audio track to inspect BPM, Key, Energy, Spectral characteristics, and Estimated Mood.</p>
      </div>

      {/* Upload Box */}
      <div className="glass-card p-8 rounded-3xl text-center space-y-6 border border-white/10 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple mx-auto">
          <Upload className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Select Audio File to Analyze</h3>
          <p className="text-xs text-gray-400">Supports MP3, WAV, FLAC, OGG (Up to 50MB)</p>
        </div>

        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="block w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-purple/20 file:text-brand-purple hover:file:bg-brand-purple/30 cursor-pointer max-w-md mx-auto"
        />

        <button
          onClick={handleUploadAnalyze}
          disabled={!file || analyzing}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mx-auto shadow-lg shadow-brand-purple/25"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Audio Signals...</span>
            </>
          ) : (
            <>
              <Activity className="w-5 h-5" />
              <span>Analyze Track Features</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Disc className="w-6 h-6 text-emerald-400" />
              <span>Audio Signal Analysis</span>
            </h3>
            <span className="text-xs uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
              {result.estimatedGenre}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 uppercase font-semibold">BPM / Tempo</span>
              <div className="text-2xl font-black text-white">{result.bpm}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 uppercase font-semibold">Musical Key</span>
              <div className="text-2xl font-black text-brand-purple">{result.key} {result.scale}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 uppercase font-semibold">Energy Level</span>
              <div className="text-2xl font-black text-brand-pink">{Math.round(result.energy * 100)}%</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-gray-400 uppercase font-semibold">Estimated Mood</span>
              <div className="text-2xl font-black text-brand-cyan capitalize">{result.mood}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
