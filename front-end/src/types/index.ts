import type { LucideIcon } from 'lucide-react';

export type SkillGroup = {
  sk?: string;
  displayOrder?: number;
  isVisible?: boolean;
  title: string;
  icon: LucideIcon;
  iconName?: string;
  skills: string[];
};

export type Project = {
  id: string;
  sk?: string;
  displayOrder?: number;
  isVisible?: boolean;
  title: string;
  category: 'Mechanical' | 'Embedded' | 'Software' | string;
  description: string;
  contribution: string;
  outcome: string;
  technologies: string[];
  icon: LucideIcon;
  iconName?: string;
  github?: string;
  accent: string;
  accentTag?: string;
};

export type AchievementItem = {
  sk?: string;
  displayOrder?: number;
  isVisible?: boolean;
  icon: LucideIcon;
  iconName?: string;
  title: string;
  text: string;
};

export type InterestItem = {
  sk?: string;
  displayOrder?: number;
  isVisible?: boolean;
  label: string;
  icon: LucideIcon;
  iconName?: string;
};

export type EducationItem = {
  sk?: string;
  displayOrder?: number;
  isVisible?: boolean;
  startYear: string;
  dateRange: string;
  institution: string;
  institutionShort: string;
  degree: string;
  location: string;
  gpa: string;
  coursework: string;
};

export type ProfileConfig = {
  availabilityHero: string;
  availabilityContact: string;
  kicker: string;
  firstName: string;
  lastName: string;
  heroDescription: string;
  heroTagsRow1: string[];
  heroTagsRow2: string[];
  aboutHeadline: string;
  aboutBody: string;
  spokenLanguages: string;
  contactLocation: string;
  links: {
    email: string;
    linkedin: string;
    github: string;
    cv: string;
  };
  lastPublishedAt?: string;
  lastModifiedAt?: string;
  lastInvalidationId?: string;
};
