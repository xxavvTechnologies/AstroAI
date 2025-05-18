export interface Mode {
  id: string;
  name: string;
  description: string;
  icon: string;
  instruction: string;
  examples?: string[];
}

export type ModeId = 'general' | 'code' | 'writing' | 'analysis' | 'creative' | 'search';
