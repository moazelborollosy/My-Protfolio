import {
  Bot,
  Braces,
  CircuitBoard,
  Cog,
  Cpu,
  Factory,
  GitBranch,
  GraduationCap,
  Plane,
  ScanLine,
  Trophy,
  Wrench,
} from 'lucide-react';
import type {
  AchievementItem,
  EducationItem,
  InterestItem,
  ProfileConfig,
  Project,
  SkillGroup,
} from '../types';

export const profileLinks = {
  email: 'mozaelborollosy@gmail.com',
  linkedin: 'https://www.linkedin.com/in/moaz-elborollosy-501885338/',
  github: 'https://github.com/moazelborollosy',
  cv: `${import.meta.env.BASE_URL}assets/Moaz-Elborollosy-CV.pdf`,
};

export const defaultProfile: ProfileConfig = {
  availabilityHero: 'Open to Werkstudent & internship roles',
  availabilityContact: 'Open to opportunities',
  kicker: 'Berlin, Germany · Mechatronics',
  firstName: 'Moaz',
  lastName: 'Elborollosy',
  heroDescription:
    'I design mechanisms, write control logic, and build software. Mechatronics Engineering student in Berlin, focused on robotics and automation.',
  heroTagsRow1: ['Robotics', 'Automation', 'Embedded Systems'],
  heroTagsRow2: ['C/C++', 'Python', 'ROS 2', 'SolidWorks'],
  aboutHeadline:
    'I’m Moaz, a Mechatronics Engineering student at German International University in Berlin.',
  aboutBody:
    'My projects span mechanical assemblies, Arduino control, circuit simulation, and Java software. I’m looking for a working-student role or internship where I can contribute to real engineering problems, learn from an experienced team, and develop my skills in robotics and automation.',
  spokenLanguages: 'Languages: English C1 · German A2 · Arabic native',
  contactLocation: 'Berlin, Germany',
  links: { ...profileLinks },
};

export const interests: InterestItem[] = [
  { label: 'Robotics', icon: Bot, iconName: 'Bot', displayOrder: 10 },
  { label: 'Industrial Automation', icon: Factory, iconName: 'Factory', displayOrder: 20 },
  { label: 'Autonomous Systems', icon: ScanLine, iconName: 'ScanLine', displayOrder: 30 },
  { label: 'Control Systems', icon: CircuitBoard, iconName: 'CircuitBoard', displayOrder: 40 },
  { label: 'Software Engineering', icon: Braces, iconName: 'Braces', displayOrder: 50 },
  { label: 'Drone Technology', icon: Plane, iconName: 'Plane', displayOrder: 60 },
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'CAD & Prototyping',
    icon: Cog,
    iconName: 'Cog',
    displayOrder: 10,
    skills: ['SolidWorks', 'AutoCAD', '3D Printing & Prototyping', 'Mechanical Assemblies'],
  },
  {
    title: 'Robotics & Automation',
    icon: Bot,
    iconName: 'Bot',
    displayOrder: 20,
    skills: ['ROS 2', 'Arduino & PIC', 'Circuit Design', 'Signal Processing'],
  },
  {
    title: 'Programming',
    icon: Braces,
    iconName: 'Braces',
    displayOrder: 30,
    skills: ['C / C++', 'Python', 'Java', 'Assembly & HTML'],
  },
  {
    title: 'Developer Tools',
    icon: GitBranch,
    iconName: 'GitBranch',
    displayOrder: 40,
    skills: ['Linux (Ubuntu)', 'Git & GitHub', 'VS Code'],
  },
];

export const projects: Project[] = [
  {
    id: 'drone',
    title: 'Custom Quadcopter Drone',
    category: 'Mechanical',
    accent: '01 / CAD & INTEGRATION',
    accentTag: 'CAD & INTEGRATION',
    icon: Plane,
    iconName: 'Plane',
    displayOrder: 10,
    description:
      'A complete multirotor assembly, designed around the challenge of fitting mechanical and electronic components into a compact airframe.',
    contribution:
      'Designed the airframe and integrated the electronics and flight-controller packaging in SolidWorks. Used motion studies to inspect propeller rotation and component clearances.',
    outcome: 'Completed a full CAD assembly and checked mechanical tolerances across the design.',
    technologies: ['SolidWorks', 'Assembly Design', 'Motion Studies'],
  },
  {
    id: 'gripper',
    title: 'Robotic Gripper',
    category: 'Mechanical',
    accent: '02 / MECHANISM DESIGN',
    accentTag: 'MECHANISM DESIGN',
    icon: Wrench,
    iconName: 'Wrench',
    displayOrder: 20,
    description:
      'A linkage-driven gripper that translates coordinated mechanical motion into a grasping action.',
    contribution:
      'Designed and assembled the mechanism in SolidWorks, configuring kinematic mates to coordinate the motion of the fingers.',
    outcome: 'Validated the mechanism’s movement within the CAD assembly.',
    technologies: ['SolidWorks', 'Kinematic Mates', 'Linkages'],
  },
  {
    id: 'arm',
    title: 'Embedded Robotic Arm',
    category: 'Embedded',
    accent: '03 / MECHANICS + CONTROL',
    accentTag: 'MECHANICS + CONTROL',
    icon: Bot,
    iconName: 'Bot',
    displayOrder: 30,
    description:
      'A multi-axis robotic arm connecting mechanical design with Arduino-based servo control.',
    contribution:
      'Designed the mechanical structure and joint configuration in SolidWorks, then wrote Arduino C++ logic for kinematic calculations and coordinated servo movement.',
    outcome: 'Connected the CAD design workflow with synchronized control across multiple joints.',
    technologies: ['SolidWorks', 'Arduino', 'C++', 'Kinematics'],
  },
  {
    id: 'filter',
    title: 'Active Low-Pass Filter',
    category: 'Embedded',
    accent: '04 / CIRCUIT DESIGN',
    accentTag: 'CIRCUIT DESIGN',
    icon: CircuitBoard,
    iconName: 'CircuitBoard',
    displayOrder: 40,
    description:
      'An active filter circuit designed to reduce high-frequency noise while preserving the useful signal.',
    contribution:
      'Designed and simulated the filter, checking its frequency response and attenuation behavior.',
    outcome: 'Verified high-frequency noise attenuation through circuit simulation.',
    technologies: ['Circuit Design', 'Simulation', 'Signal Processing'],
  },
  {
    id: 'interpreter',
    title: 'Assembly Interpreter',
    category: 'Software',
    accent: '05 / COMPUTER ARCHITECTURE',
    accentTag: 'COMPUTER ARCHITECTURE',
    icon: Cpu,
    iconName: 'Cpu',
    displayOrder: 50,
    description:
      'A Java interpreter that parses assembly instructions and executes them in a simulated CPU with registers, memory, and status flags.',
    contribution:
      'Built parsing, decoding, and instruction execution logic as part of a team project, with error handling for invalid instructions and runtime failures.',
    outcome:
      'Passed all required and bonus test cases; the team earned the highest overall project score.',
    technologies: ['Java', 'Parsing', 'CPU Simulation', 'Exception Handling'],
    github: 'https://github.com/moazelborollosy/Assembly-Interpreter',
  },
  {
    id: 'game',
    title: 'Clans of the Eclipse',
    category: 'Software',
    accent: '06 / OBJECT-ORIENTED SOFTWARE',
    accentTag: 'OBJECT-ORIENTED SOFTWARE',
    icon: Braces,
    iconName: 'Braces',
    displayOrder: 60,
    description:
      'A turn-based strategy game with a Java game engine and graphical interface.',
    contribution:
      'Developed core gameplay logic and exception handling, and designed and implemented the GUI to connect player actions with the engine.',
    outcome: 'Delivered stable gameplay with a responsive graphical interface.',
    technologies: ['Java', 'OOP', 'GUI', 'Game Logic'],
    github: 'https://github.com/moazelborollosy/Clan-of-the-eclipce',
  },
];

export const achievements: AchievementItem[] = [
  {
    icon: GraduationCap,
    iconName: 'GraduationCap',
    displayOrder: 10,
    title: 'Full merit scholarship',
    text: 'Selected on academic merit to complete undergraduate studies in Germany.',
  },
  {
    icon: Trophy,
    iconName: 'Trophy',
    displayOrder: 20,
    title: 'Highest team project score',
    text: 'Assembly interpreter: all required and bonus test cases passed.',
  },
  {
    icon: Cpu,
    iconName: 'Cpu',
    displayOrder: 30,
    title: '1.16 academic GPA',
    text: 'German grading scale · Grade A · German International University.',
  },
];

export const defaultEducation: EducationItem[] = [
  {
    displayOrder: 10,
    startYear: '2024',
    dateRange: 'September 2024 — July 2028 (expected)',
    institution: 'German International University',
    institutionShort: '(GIU)',
    degree: 'B.Sc. in Mechatronics Engineering',
    location: 'Berlin, Germany',
    gpa: 'GPA 1.16 · German scale',
    coursework:
      'Relevant coursework: Kinematics & Robotics, Control Systems, Signals & Systems, Embedded Systems, Microcontroller Programming, and Computer Architecture.',
  },
];
