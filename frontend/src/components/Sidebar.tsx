import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wand2, Sliders, FileMusic, Activity, User } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/composer', label: 'AI Composer', icon: Wand2 },
    { to: '/studio', label: 'Studio Workspace', icon: Sliders },
    { to: '/library', label: 'Music Library', icon: FileMusic },
    { to: '/analyzer', label: 'Audio Analyzer', icon: Activity },
    { to: '/profile', label: 'User Profile', icon: User },
  ];

  return (
    <aside className="w-64 glass-card border-r border-white/10 hidden md:flex flex-col py-6 px-4 shrink-0 min-h-[calc(100vh-73px)]">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Studio Menu</div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-purple/20 to-brand-pink/20 text-white border border-brand-purple/40 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 text-brand-purple" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
