import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Heart, RotateCcw } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { api } from '../services/api';

interface AudioPlayerProps {
  src?: string;
  midiUrl?: string;
  title?: string;
  artist?: string;
  projectId?: string;
  isFavorited?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  midiUrl,
  title = 'AI Composition',
  artist = 'AI Personal Composer',
  projectId,
  isFavorited = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [fav, setFav] = useState(isFavorited);

  useEffect(() => {
    setFav(isFavorited);
  }, [isFavorited]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
    setIsMuted(v === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.8, 1.0, 1.25, 1.5, 2.0];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFavorite = async () => {
    if (!projectId) return;
    try {
      if (fav) {
        await api.removeFavorite(projectId);
        setFav(false);
      } else {
        await api.addFavorite(projectId);
        setFav(true);
      }
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return '00:00';
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!src) return null;

  return (
    <div className="glass-card rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl space-y-4">
      <audio ref={audioRef} src={src} />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center font-bold text-white shadow-lg">
            🎵
          </div>
          <div>
            <h4 className="font-semibold text-white truncate max-w-xs">{title}</h4>
            <p className="text-xs text-gray-400">{artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink flex items-center justify-center text-white hover:scale-105 transition-transform shadow-lg shadow-brand-purple/30"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={changeSpeed}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-brand-purple border border-brand-purple/30"
          >
            {playbackSpeed}x
          </button>

          {projectId && (
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition-colors ${fav ? 'text-rose-500 bg-rose-500/10' : 'text-gray-400 hover:text-rose-400 bg-white/5'}`}
            >
              <Heart className={`w-5 h-5 ${fav ? 'fill-current' : ''}`} />
            </button>
          )}

          <a
            href={src}
            download="ai-composition.wav"
            className="px-2.5 py-1.5 rounded-lg text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Download WAV Audio"
          >
            <Download className="w-3.5 h-3.5" />
            <span>WAV</span>
          </a>

          {midiUrl && (
            <a
              href={midiUrl}
              download="ai-composition.mid"
              className="px-2.5 py-1.5 rounded-lg text-brand-purple hover:text-white bg-brand-purple/10 hover:bg-brand-purple/20 transition-colors flex items-center gap-1.5 text-xs font-semibold border border-brand-purple/30"
              title="Download MIDI Track"
            >
              <Download className="w-3.5 h-3.5" />
              <span>MIDI</span>
            </a>
          )}
        </div>
      </div>

      <WaveformVisualizer isPlaying={isPlaying} audioRef={audioRef} />

      {/* Progress Bar & Timestamps */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-brand-purple bg-gray-700 h-1.5 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
