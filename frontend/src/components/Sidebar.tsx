import React from 'react';
import { Search } from 'lucide-react';

interface NavLink {
  label: string;
  href: string;
}

interface MoodPill {
  label: string;
  onSelect: () => void;
}

interface GenreFilter {
  label: string;
  onToggle: () => void;
}

export const Sidebar: React.FC = () => {
  const [activeGenre, setActiveGenre] = React.useState<string | null>(null);

  const navLinks: NavLink[] = [
    { label: 'My Library', href: '#' },
    { label: 'Discover', href: '#' },
    { label: 'Curators', href: '#' },
    { label: 'Genres', href: '#' },
    { label: 'Settings', href: '#' },
  ];

  const moods: MoodPill[] = [
    { label: 'Chill', onSelect: () => {} },
    { label: 'Energetic', onSelect: () => {} },
    { label: 'Focus', onSelect: () => {} },
    { label: 'Nostalgic', onSelect: () => {} },
    { label: 'Atmospheric', onSelect: () => {} },
    { label: 'Late Night', onSelect: () => {} },
  ];

  const genres: GenreFilter[] = [
    { label: 'Ambient', onToggle: () => {} },
    { label: 'Indie', onToggle: () => {} },
    { label: 'Electronic', onToggle: () => {} },
    { label: 'Lo-Fi', onToggle: () => {} },
    { label: 'Neo-Soul', onToggle: () => {} },
    { label: 'Pop', onToggle: () => {} },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-white/10 backdrop-blur-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-zinc-100 font-bold text-sm">
            M
          </div>
          <h1 className="text-xl font-semibold text-white">MItone</h1>
        </div>
        <Search className="w-5 h-5 text-zinc-400" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 pt-2">
        <ul className="flex flex-col gap-2 px-2">
          {navLinks.map((link, i) => (
            <li key={i}>
              <a
                href={link.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                style={{ background: activeGenre === 'genres' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mood Selector */}
      <div className="px-2 pt-3 border-t border-white/10">
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Mood</h2>
        <div className="flex flex-wrap gap-1">
          {moods.map((mood, i) => (
            <button
              key={i}
              className="flex items-center gap-1 rounded-full px-2 py-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-white/5 transition-colors text-xs font-medium"
              style={{ background: activeGenre === 'mood' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filters */}
      <div className="px-2 pt-3 border-t border-white/10">
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Genre</h2>
        <div className="flex flex-wrap gap-1">
          {genres.map((genre, i) => (
            <button
              key={i}
              className="flex items-center gap-1.5 rounded-full px-2 py-1 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors text-xs font-medium"
              onClick={(e) => {
                e.stopPropagation();
                genre.onToggle();
                setActiveGenre(genre.label);
              }}
            >
              {genre.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mini Now-Playing widget */}
      <div className="px-2 pb-4 border-t border-white/10 flex items-center gap-3">
        <img
          src="/placeholder-album.svg"
          alt="Album art"
          className="w-8 h-8 rounded object-cover"
        />
        <div>
          <p className="text-zinc-400 text-sm">No playlist playing</p>
          <p className="text-zinc-500 text-xs">Click to add tracks</p>
        </div>
      </div>
    </aside>
  );
};
