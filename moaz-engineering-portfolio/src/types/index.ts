import type { LucideIcon } from 'lucide-react';
export type SkillGroup = { title: string; icon: LucideIcon; skills: string[] };
export type Project = {
  id: string; title: string; category: 'Mechanical' | 'Embedded' | 'Software';
  description: string; contribution: string; outcome: string; technologies: string[];
  icon: LucideIcon; github?: string; accent: string;
};
