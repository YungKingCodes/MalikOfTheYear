// Common player-related type definitions

export interface ProficiencyData {
  name: string;
  score: number;
  value?: number; // For backward compatibility
}

export interface Competition {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  year: number;
}

export interface Award {
  name: string;
  date: string;
}

export interface PlayerData {
  id: string;
  _id: string;
  name: string;
  email: string;
  image?: string;
  position: string;
  role: string;
  teamId: string;
  teamName: string;
  proficiencyScore: number;
  wins: number;
  losses: number;
  titles: string[];
  proficiencies: ProficiencyData[];
  competitions: Competition[];
  awards: Award[];
  createdAt: string;
} 