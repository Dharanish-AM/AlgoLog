export interface Student {
  id: string;
  rollNo: string;
  name: string;
  department: string;
  class: string;
  year: number;
  problemsSolved: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  };
  rating: number;
  globalRank: number;
  contestCount: number;
  topPercent: number;
}

export interface Contest {
  id: string;
  title: string;
  startTime: Date;
  duration: number;
  virtual: boolean;
  totalProblems: number;
  participants?: ContestParticipant[];
}

export interface ContestParticipant {
  id: string;
  rollNo: string;
  name: string;
  problemsSolved: number;
  totalProblems: number;
  rating: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
  finishTime: number;
}

export interface FilterState {
  department: string;
  class: string;
  year: string;
}