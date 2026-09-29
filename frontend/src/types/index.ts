export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  preferences?: {
    favoriteGenres?: string[];
    favoriteMoods?: string[];
    favoriteInstruments?: string[];
    defaultBpm?: number;
    defaultDuration?: number;
  };
  createdAt: string;
}

export interface Project {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  genre?: string;
  mood?: string;
  bpm?: number;
  key?: string;
  scale?: string;
  duration?: number;
  instruments?: string[];
  prompt?: string;
  audioUrl?: string;
  midiUrl?: string;
  coverImage?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generationTime?: number;
  structure?: {
    sections: Array<{ name: string; duration: number; bars: number }>;
  };
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  suggestion: {
    genre: string;
    mood: string;
    instruments: string[];
    bpm: number;
  };
}

export interface MusicAnalysis {
  bpm: number;
  key: string;
  scale: string;
  energy: number;
  mood: string;
  duration: number;
  estimatedGenre: string;
}

export interface UserStats {
  totalProjects: number;
  totalFavorites: number;
  totalGenerations: number;
  genreDistribution: Array<{ genre: string; count: number }>;
  moodDistribution: Array<{ mood: string; count: number }>;
}
