import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Shield, Save, CheckCircle2, Music, Heart, Star } from 'lucide-react';
import { api } from '../services/api';

const ALL_GENRES = ['Classical', 'Lo-Fi', 'Pop', 'Rock', 'Jazz', 'Electronic', 'Hip-Hop', 'Cinematic', 'Ambient', 'Folk'];
const ALL_MOODS = ['Happy', 'Sad', 'Relaxed', 'Energetic', 'Romantic', 'Dark', 'Peaceful', 'Inspirational', 'Mysterious'];
const ALL_INSTRUMENTS = ['Piano', 'Guitar', 'Violin', 'Cello', 'Flute', 'Synth', 'Bass', 'Drums', 'Strings', 'Percussion'];

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [favGenres, setFavGenres] = useState<string[]>(user?.preferences?.favoriteGenres || []);
  const [favMoods, setFavMoods] = useState<string[]>(user?.preferences?.favoriteMoods || []);
  const [favInstruments, setFavInstruments] = useState<string[]>(user?.preferences?.favoriteInstruments || []);
  const [defaultBpm, setDefaultBpm] = useState(user?.preferences?.defaultBpm || 90);

  const toggleItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setList((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.updateProfile({
        name,
        preferences: {
          favoriteGenres: favGenres,
          favoriteMoods: favMoods,
          favoriteInstruments: favInstruments,
          defaultBpm,
        },
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-brand-purple" />
          <span>User Profile &amp; Preferences</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage your composer account settings and musical preferences.</p>
      </div>

      {/* Profile Header Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-r from-brand-purple/10 via-transparent to-brand-pink/10 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-brand-purple/30 shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30">
              <Shield className="w-3 h-3 inline mr-1" />{user?.role || 'user'}
            </span>
            <span className="text-xs text-gray-500">Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="glass-card p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Profile &amp; preferences saved successfully!
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-purple border-b border-brand-purple/20 pb-2">
              Account Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Display Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-900/30 border border-white/5 text-gray-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Default BPM (Tempo)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={50}
                  max={200}
                  value={defaultBpm}
                  onChange={(e) => setDefaultBpm(Number(e.target.value))}
                  className="flex-1 accent-brand-purple"
                />
                <span className="text-white font-mono font-bold w-20 text-center text-sm bg-dark-900/60 border border-white/10 px-3 py-1.5 rounded-lg">{defaultBpm} BPM</span>
              </div>
            </div>
          </div>

          {/* Genre Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-purple border-b border-brand-purple/20 pb-2 flex items-center gap-2">
              <Music className="w-3.5 h-3.5" /> Favorite Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleItem(favGenres, setFavGenres, g)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    favGenres.includes(g)
                      ? 'bg-gradient-to-r from-brand-purple to-brand-pink text-white shadow-md shadow-brand-purple/20'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-purple border-b border-brand-purple/20 pb-2 flex items-center gap-2">
              <Star className="w-3.5 h-3.5" /> Favorite Moods
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALL_MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleItem(favMoods, setFavMoods, m)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    favMoods.includes(m)
                      ? 'bg-gradient-to-r from-brand-pink to-brand-cyan text-white shadow-md shadow-brand-pink/20'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Instrument Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-purple border-b border-brand-purple/20 pb-2 flex items-center gap-2">
              <Heart className="w-3.5 h-3.5" /> Favorite Instruments
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALL_INSTRUMENTS.map((inst) => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => toggleItem(favInstruments, setFavInstruments, inst)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    favInstruments.includes(inst)
                      ? 'bg-gradient-to-r from-brand-cyan to-brand-indigo text-white shadow-md shadow-brand-cyan/20'
                      : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 text-white font-bold text-sm transition-opacity flex items-center gap-2 shadow-lg shadow-brand-purple/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};



