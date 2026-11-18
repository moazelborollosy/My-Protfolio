import {
  Award,
  BookOpen,
  Bot,
  Braces,
  CircuitBoard,
  Code2,
  Cog,
  Cpu,
  Factory,
  FileText,
  GitBranch,
  Globe,
  GraduationCap,
  Layers,
  Plane,
  Rocket,
  ScanLine,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  BookOpen,
  Bot,
  Braces,
  CircuitBoard,
  Code2,
  Cog,
  Cpu,
  Factory,
  FileText,
  GitBranch,
  Globe,
  GraduationCap,
  Layers,
  Plane,
  Rocket,
  ScanLine,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
  Wrench,
  Zap,
};

export const AVAILABLE_ICON_NAMES = Object.keys(ICON_MAP);

export function resolveIcon(name?: string, fallback: LucideIcon = Cpu): LucideIcon {
  if (!name) return fallback;
  return ICON_MAP[name] ?? fallback;
}
