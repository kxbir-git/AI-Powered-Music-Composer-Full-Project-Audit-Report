import React, { useState } from 'react';
import { Sliders, Bot, Play, Pause, Plus, Trash2, Send, Sparkles } from 'lucide-react';

interface TrackChannel {
  id: string;
  name: string;
  instrument: string;
  color: string;
  volume: number;
}

export const StudioPage: React.FC = () => {
  const [channels, setChannels] = useState<TrackChannel[]>([
    { id: '1', name: 'Piano Harmony', instrument: 'Piano', color: 'from-purple-500 to-indigo-500', volume: 80 },
    { id: '2', name: 'Ambient Strings', instrument: 'Strings', color: 'from-pink-500 to-rose-500', volume: 65 },
    { id: '3', name: 'Sub Bass', instrument: 'Bass', color: 'from-cyan-500 to-blue-500', volume: 75 },
    { id: '4', name: 'Lo-Fi Drums', instrument: 'Drums', color: 'from-emerald-500 to-teal-500', volume: 70 },
  ]);

  const [aiMessage, setAiMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string }>>([
    { sender: 'AI Assistant', text: 'Welcome to the Studio Workspace! How can I refine your arrangement today?' },
  ]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userText = aiMessage;
    setChatLog((prev) => [...prev, { sender: 'You', text: userText }]);
    setAiMessage('');

    setTimeout(() => {
      let reply = "Got it! Adjusting track parameters and regenerating arrangement variation...";
      if (userText.toLowerCase().includes('drum') || userText.toLowerCase().includes('energetic')) {
        reply = "Increased drum beat syncopation and boosted tempo to 110 BPM!";
      } else if (userText.toLowerCase().includes('piano') || userText.toLowerCase().includes('emotional')) {
        reply = "Enhanced piano harmonic voicings and added soft reverberation.";
      }
      setChatLog((prev) => [...prev, { sender: 'AI Assistant', text: reply }]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Sliders className="w-8 h-8 text-brand-purple" />
            <span>Studio Workspace</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Multi-track arrangement, instrument mixing, and conversational AI assistant.</p>
        </div>
      </div>

      {/* Main Studio Timeline Grid */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-white/10 pb-3">
          <span>Instruments & Tracks</span>
          <span>Timeline / DAW Sequence (Intro • Verse • Chorus • Outro)</span>
        </div>

        <div className="space-y-3">
          {channels.map((channel) => (
            <div key={channel.id} className="grid grid-cols-12 gap-4 items-center bg-dark-900/60 p-3 rounded-2xl border border-white/5">
              <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                <div className={`w-3 h-10 rounded-full bg-gradient-to-b ${channel.color}`} />
                <div>
                  <h4 className="font-bold text-white text-sm truncate">{channel.name}</h4>
                  <span className="text-[10px] text-gray-400 uppercase">{channel.instrument}</span>
                </div>
              </div>

              {/* Timeline Track Pattern */}
              <div className="col-span-8 md:col-span-9 flex items-center gap-1 overflow-x-auto py-1">
                {[...Array(16)].map((_, step) => (
                  <div
                    key={step}
                    className={`h-8 min-w-[2.5rem] rounded-lg border flex items-center justify-center transition-all ${
                      step % 4 === 0
                        ? `bg-gradient-to-r ${channel.color} opacity-80 border-white/20`
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-white/50">{step + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversational AI Assistant Panel */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-white/10">
        <div className="flex items-center gap-2 font-bold text-white text-sm">
          <Bot className="w-5 h-5 text-brand-pink" />
          <span>AI Composition Assistant</span>
        </div>

        <div className="h-44 overflow-y-auto space-y-3 p-4 rounded-2xl bg-dark-900/80 border border-white/5 text-sm">
          {chatLog.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-gray-400 mb-0.5">{msg.sender}</span>
              <div
                className={`px-4 py-2 rounded-2xl max-w-md ${
                  msg.sender === 'You'
                    ? 'bg-brand-purple text-white rounded-br-none'
                    : 'bg-white/10 text-gray-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={aiMessage}
            onChange={(e) => setAiMessage(e.target.value)}
            placeholder="e.g. 'Make the chorus more energetic' or 'Replace piano with acoustic guitar'"
            className="flex-1 px-4 py-3 rounded-xl bg-dark-900/60 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-purple"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-bold text-sm transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
