import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center shadow-lg shadow-brand-purple/20 group-hover:scale-105 transition-transform">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold font-sans text-gradient">AI Composer</span>
          <span className="hidden sm:inline-block ml-2 text-xs uppercase px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30">Studio v1.0</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/composer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-md shadow-brand-purple/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Compose Music</span>
            </Link>
            
            <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-full bg-brand-indigo/30 border border-brand-indigo/50 flex items-center justify-center text-brand-purple font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-medium">{user.name}</span>
            </Link>

            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors font-medium">
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-medium transition-colors shadow-lg shadow-brand-purple/20"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
