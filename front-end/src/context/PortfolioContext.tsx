import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  achievements as defaultAchievements,
  defaultEducation,
  defaultProfile,
  interests as defaultInterests,
  projects as defaultProjects,
  skillGroups as defaultSkillGroups,
} from '../data/portfolio';
import type {
  AchievementItem,
  EducationItem,
  InterestItem,
  ProfileConfig,
  Project,
  SkillGroup,
} from '../types';
import { resolveIcon } from '../utils/icons';

type PortfolioState = {
  profile: ProfileConfig;
  projects: Project[];
  skillGroups: SkillGroup[];
  achievements: AchievementItem[];
  interests: InterestItem[];
  education: EducationItem[];
  isLoadedFromApi: boolean;
  refreshPortfolio: () => Promise<void>;
};

const PortfolioContext = createContext<PortfolioState>({
  profile: defaultProfile,
  projects: defaultProjects,
  skillGroups: defaultSkillGroups,
  achievements: defaultAchievements,
  interests: defaultInterests,
  education: defaultEducation,
  isLoadedFromApi: false,
  refreshPortfolio: async () => {},
});

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<PortfolioState, 'refreshPortfolio'>>({
    profile: defaultProfile,
    projects: defaultProjects,
    skillGroups: defaultSkillGroups,
    achievements: defaultAchievements,
    interests: defaultInterests,
    education: defaultEducation,
    isLoadedFromApi: false,
  });

  async function fetchPortfolio() {
    try {
      const res = await fetch(`${API_BASE}/api/portfolio`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();

      const profile: ProfileConfig = data.profile
        ? {
            ...defaultProfile,
            ...data.profile,
            links: {
              ...defaultProfile.links,
              ...(data.profile.links || {}),
            },
          }
        : defaultProfile;

      const projects: Project[] = Array.isArray(data.projects) && data.projects.length > 0
        ? data.projects.map((p: Record<string, unknown>, idx: number) => {
            const num = String(idx + 1).padStart(2, '0');
            const tag = (p.accentTag as string) || (p.accent as string) || 'PROJECT';
            const cleanTag = tag.replace(/^\d+\s*\/\s*/, '');
            return {
              id: (p.slug as string) || (p.sk as string) || `proj-${idx}`,
              sk: p.sk as string,
              displayOrder: Number(p.displayOrder ?? (idx + 1) * 10),
              title: (p.title as string) || '',
              category: (p.category as string) || 'Mechanical',
              accent: `${num} / ${cleanTag}`,
              accentTag: cleanTag,
              icon: resolveIcon(p.icon as string),
              iconName: (p.icon as string) || 'Cpu',
              description: (p.description as string) || '',
              contribution: (p.contribution as string) || '',
              outcome: (p.outcome as string) || '',
              technologies: Array.isArray(p.technologies) ? (p.technologies as string[]) : [],
              github: (p.github as string) || undefined,
            };
          })
        : defaultProjects;

      const skillGroups: SkillGroup[] =
        Array.isArray(data.skillGroups) && data.skillGroups.length > 0
          ? data.skillGroups.map((sg: Record<string, unknown>, idx: number) => ({
              sk: sg.sk as string,
              displayOrder: Number(sg.displayOrder ?? (idx + 1) * 10),
              title: (sg.title as string) || '',
              icon: resolveIcon(sg.icon as string),
              iconName: (sg.icon as string) || 'Cog',
              skills: Array.isArray(sg.skills) ? (sg.skills as string[]) : [],
            }))
          : defaultSkillGroups;

      const achievements: AchievementItem[] =
        Array.isArray(data.achievements) && data.achievements.length > 0
          ? data.achievements.map((a: Record<string, unknown>, idx: number) => ({
              sk: a.sk as string,
              displayOrder: Number(a.displayOrder ?? (idx + 1) * 10),
              title: (a.title as string) || '',
              text: (a.text as string) || '',
              icon: resolveIcon(a.icon as string),
              iconName: (a.icon as string) || 'Trophy',
            }))
          : defaultAchievements;

      const interests: InterestItem[] =
        Array.isArray(data.interests) && data.interests.length > 0
          ? data.interests.map((i: Record<string, unknown>, idx: number) => ({
              sk: i.sk as string,
              displayOrder: Number(i.displayOrder ?? (idx + 1) * 10),
              label: (i.label as string) || '',
              icon: resolveIcon(i.icon as string),
              iconName: (i.icon as string) || 'Bot',
            }))
          : defaultInterests;

      const education: EducationItem[] =
        Array.isArray(data.education) && data.education.length > 0
          ? data.education.map((e: Record<string, unknown>, idx: number) => ({
              sk: e.sk as string,
              displayOrder: Number(e.displayOrder ?? (idx + 1) * 10),
              startYear: (e.startYear as string) || '2024',
              dateRange: (e.dateRange as string) || '',
              institution: (e.institution as string) || '',
              institutionShort: (e.institutionShort as string) || '',
              degree: (e.degree as string) || '',
              location: (e.location as string) || '',
              gpa: (e.gpa as string) || '',
              coursework: (e.coursework as string) || '',
            }))
          : defaultEducation;

      setState({
        profile,
        projects,
        skillGroups,
        achievements,
        interests,
        education,
        isLoadedFromApi: true,
      });
    } catch {
      // Fallback silently to bundled static defaults
    }
  }

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <PortfolioContext.Provider value={{ ...state, refreshPortfolio: fetchPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
