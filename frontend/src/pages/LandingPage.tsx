import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Music, Sliders, Cpu, Zap, Radio, Download, ShieldCheck,
  ArrowRight, Wand2, BrainCircuit, Waves, Play, FileMusic, Activity,
  ChevronRight,
} from 'lucide-react';

/* ─── Animated waveform bars (hero decoration) ─── */
const HeroWaveform: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 64;
      const bw = canvas.width / bars;
      for (let i = 0; i < bars; i++) {
        const h = Math.abs(Math.sin(phase + i * 0.18) * 55 + Math.cos(phase * 1.3 + i * 0.12) * 30 + 18);
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, 'rgba(139,92,246,0.85)');
        grad.addColorStop(0.5, 'rgba(236,72,153,0.7)');
        grad.addColorStop(1, 'rgba(6,182,212,0.5)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(i * bw + 2, (canvas.height - h) / 2, bw - 4, h, 4);
        ctx.fill();
      }
      phase += 0.04;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} width={900} height={90} className="w-full h-16 md:h-20 opacity-80" />;
};

/* ─── Animated counter ─── */
const Counter: React.FC<{ target: number; suffix?: string }> = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(target / 60);
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const FEATURES = [
  { icon: BrainCircuit, title: 'Neural NLP Engine', desc: 'Parse your text prompt to extract key, scale, mood, and genre using advanced NLP rules and keyword mapping.', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', iconColor: 'text-violet-400' },
  { icon: Sliders, title: 'Advanced Controls', desc: 'Fine-tune BPM, harmonic scale, time signature, instruments, duration, and structure in Advanced Mode.', color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30', iconColor: 'text-pink-400' },
  { icon: Zap, title: 'Instant Rendering', desc: 'Sub-second synthesis engine with rule-based algorithmic fallback — works without GPU or internet.', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', iconColor: 'text-cyan-400' },
  { icon: Waves, title: 'Real-Time Waveform', desc: 'Watch your composition visualized live as it plays, with animated frequency bars and spectral display.', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', iconColor: 'text-emerald-400' },
  { icon: FileMusic, title: 'Music Library', desc: 'Store, organize, search, and preview all your AI-generated compositions in a personal cloud library.', color: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', iconColor: 'text-orange-400' },
  { icon: Activity, title: 'Audio Analyzer', desc: 'Upload any MP3/WAV to instantly detect BPM, musical key, energy level, mood, and estimated genre.', color: 'from-fuchsia-500/20 to-purple-500/20', border: 'border-fuchsia-500/30', iconColor: 'text-fuchsia-400' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Describe Your Vision', desc: 'Type a natural-language prompt like "relaxing piano track for studying at night."', icon: Sparkles },
  { step: '02', title: 'AI Composes the Score', desc: 'NLP extracts parameters, music theory engine builds chord progressions, melody, and rhythm.', icon: BrainCircuit },
  { step: '03', title: 'Audio is Synthesized', desc: 'Multi-track audio is rendered in real-time using procedural synthesis and MIDI pipelines.', icon: Waves },
  { step: '04', title: 'Download & Iterate', desc: 'Play, visualize, create variations, and export as WAV, MP3, or MIDI.', icon: Download },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-32 py-12 px-4 md:px-6 max-w-7xl mx-auto overflow-hidden">

      {/* ──────────── HERO ──────────── */}
      <section className="text-center space-y-8 pt-8 relative">
        {/* Glow orbs */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-pink/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-semibold tracking-wide uppercase animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5" /> Next-Generation AI Audio Engine
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Compose Original Music with{' '}
          <span className="text-gradient">Artificial Intelligence</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
          Transform text prompts, moods, and musical parameters into studio-quality
          instrumental compositions in seconds — no musical training required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan text-white font-bold text-lg hover:opacity-95 transition-all shadow-xl shadow-brand-purple/25 flex items-center justify-center gap-2 group"
          >
            <span>Start Composing Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/composer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-white font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <Radio className="w-5 h-5 text-brand-pink" />
            <span>Open AI Composer</span>
          </Link>
        </div>

        {/* Animated Waveform */}
        <div className="mt-8 glass-card rounded-3xl p-4 md:p-6 border border-white/10 shadow-2xl max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center shadow-lg">
              <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">AI Cinematic Composition — C Major · 90 BPM</div>
              <div className="text-xs text-gray-500">Generated in 1.4s · Piano · Strings · Sub-bass</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-semibold">LIVE</span>
            </div>
          </div>
          <HeroWaveform />
          <div className="flex justify-between text-xs text-gray-500 font-mono mt-2 px-1">
            <span>00:00</span>
            <span>00:30</span>
          </div>
        </div>
      </section>

      {/* ──────────── STATS ──────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { value: 10000, suffix: '+', label: 'Compositions Generated', icon: Music },
          { value: 50, suffix: 'ms', label: 'Average Generation Time', icon: Zap },
          { value: 10, suffix: ' Genres', label: 'Music Genres Supported', icon: Sliders },
          { value: 100, suffix: '%', label: 'GPU-Free Operation', icon: ShieldCheck },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 rounded-2xl text-center space-y-2 border border-white/10 glass-card-hover">
              <Icon className="w-6 h-6 text-brand-purple mx-auto" />
              <div className="text-3xl font-black text-white">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
            </div>
          );
        })}
      </section>

      {/* ──────────── HOW IT WORKS ──────────── */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-semibold tracking-wide uppercase">
            <BrainCircuit className="w-3.5 h-3.5" /> How It Works
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            From Prompt to <span className="text-gradient">Playable Track</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            Our end-to-end AI pipeline handles everything from NLP analysis to final audio rendering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-3 top-8 w-6 h-6 text-brand-purple/40 z-10" />
                )}
                <div className="glass-card glass-card-hover p-6 rounded-2xl space-y-4 border border-white/10 h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple/20 to-brand-pink/20 border border-brand-purple/30 flex items-center justify-center text-brand-purple">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-black text-white/10">{step.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────── FEATURES GRID ──────────── */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-pink/10 border border-brand-pink/30 text-brand-pink text-xs font-semibold tracking-wide uppercase">
            <Wand2 className="w-3.5 h-3.5" /> Full Feature Suite
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Everything You Need to <span className="text-gradient">Create</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className={`glass-card glass-card-hover p-7 rounded-2xl space-y-4 border ${feat.border}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} border ${feat.border} flex items-center justify-center ${feat.iconColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────── TECH STACK STRIP ──────────── */}
      <section className="glass-card rounded-2xl p-6 border border-white/10 flex flex-wrap items-center justify-center gap-6">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Built with</span>
        {['React + TypeScript', 'FastAPI', 'Python 3.11', 'MongoDB', 'music21', 'NumPy / SciPy', 'Vite'].map((tech) => (
          <span key={tech} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
            {tech}
          </span>
        ))}
      </section>

      {/* ──────────── FINAL CTA ──────────── */}
      <section className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center space-y-6">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/20 via-brand-pink/10 to-brand-cyan/10 pointer-events-none" />
        <div className="absolute inset-0 glass-card pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Ready to Create Your First<br />
            <span className="text-gradient">AI Masterpiece?</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">
            Join thousands of creators generating original music with the power of artificial intelligence. Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan text-white font-bold text-lg hover:opacity-95 transition-all shadow-2xl shadow-brand-purple/30 flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl text-gray-300 hover:text-white font-semibold text-base transition-colors"
            >
              Already have an account? Sign In →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};




