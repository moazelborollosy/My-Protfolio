import { Bot, Braces, CircuitBoard, Cog, Cpu, Factory, GitBranch, GraduationCap, Plane, ScanLine, Trophy, Wrench } from 'lucide-react';
import type { Project, SkillGroup } from '../types';
export const profileLinks = {
 email: 'mozaelborollosy@gmail.com',
 linkedin: 'https://www.linkedin.com/in/moaz-elborollosy-501885338/',
 github: 'https://github.com/moazelborollosy',
 cv: `${import.meta.env.BASE_URL}assets/Moaz-Elborollosy-CV.pdf`,
};
export const interests = [
 {label:'Robotics',icon:Bot}, {label:'Industrial Automation',icon:Factory},
 {label:'Autonomous Systems',icon:ScanLine}, {label:'Control Systems',icon:CircuitBoard},
 {label:'Software Engineering',icon:Braces}, {label:'Drone Technology',icon:Plane},
];
export const skillGroups: SkillGroup[] = [
 {title:'CAD & Prototyping',icon:Cog,skills:['SolidWorks','AutoCAD','3D Printing & Prototyping','Mechanical Assemblies']},
 {title:'Robotics & Automation',icon:Bot,skills:['ROS 2','Arduino & PIC','Circuit Design','Signal Processing']},
 {title:'Programming',icon:Braces,skills:['C / C++','Python','Java','Assembly & HTML']},
 {title:'Developer Tools',icon:GitBranch,skills:['Linux (Ubuntu)','Git & GitHub','VS Code']},
];
export const projects: Project[] = [
 {id:'drone',title:'Custom Quadcopter Drone',category:'Mechanical',accent:'01 / CAD & INTEGRATION',icon:Plane,
 description:'A complete multirotor assembly, designed around the challenge of fitting mechanical and electronic components into a compact airframe.',
 contribution:'Designed the airframe and integrated the electronics and flight-controller packaging in SolidWorks. Used motion studies to inspect propeller rotation and component clearances.',
 outcome:'Completed a full CAD assembly and checked mechanical tolerances across the design.',technologies:['SolidWorks','Assembly Design','Motion Studies']},
 {id:'gripper',title:'Robotic Gripper',category:'Mechanical',accent:'02 / MECHANISM DESIGN',icon:Wrench,
 description:'A linkage-driven gripper that translates coordinated mechanical motion into a grasping action.',
 contribution:'Designed and assembled the mechanism in SolidWorks, configuring kinematic mates to coordinate the motion of the fingers.',
 outcome:'Validated the mechanism’s movement within the CAD assembly.',technologies:['SolidWorks','Kinematic Mates','Linkages']},
 {id:'arm',title:'Embedded Robotic Arm',category:'Embedded',accent:'03 / MECHANICS + CONTROL',icon:Bot,
 description:'A multi-axis robotic arm connecting mechanical design with Arduino-based servo control.',
 contribution:'Designed the mechanical structure and joint configuration in SolidWorks, then wrote Arduino C++ logic for kinematic calculations and coordinated servo movement.',
 outcome:'Connected the CAD design workflow with synchronized control across multiple joints.',technologies:['SolidWorks','Arduino','C++','Kinematics']},
 {id:'filter',title:'Active Low-Pass Filter',category:'Embedded',accent:'04 / CIRCUIT DESIGN',icon:CircuitBoard,
 description:'An active filter circuit designed to reduce high-frequency noise while preserving the useful signal.',
 contribution:'Designed and simulated the filter, checking its frequency response and attenuation behavior.',
 outcome:'Verified high-frequency noise attenuation through circuit simulation.',technologies:['Circuit Design','Simulation','Signal Processing']},
 {id:'interpreter',title:'Assembly Interpreter',category:'Software',accent:'05 / COMPUTER ARCHITECTURE',icon:Cpu,
 description:'A Java interpreter that parses assembly instructions and executes them in a simulated CPU with registers, memory, and status flags.',
 contribution:'Built parsing, decoding, and instruction execution logic as part of a team project, with error handling for invalid instructions and runtime failures.',
 outcome:'Passed all required and bonus test cases; the team earned the highest overall project score.',technologies:['Java','Parsing','CPU Simulation','Exception Handling'],github:'https://github.com/moazelborollosy/Assembly-Interpreter'},
 {id:'game',title:'Clans of the Eclipse',category:'Software',accent:'06 / OBJECT-ORIENTED SOFTWARE',icon:Braces,
 description:'A turn-based strategy game with a Java game engine and graphical interface.',
 contribution:'Developed core gameplay logic and exception handling, and designed and implemented the GUI to connect player actions with the engine.',
 outcome:'Delivered stable gameplay with a responsive graphical interface.',technologies:['Java','OOP','GUI','Game Logic'],github:'https://github.com/moazelborollosy/Clan-of-the-eclipce'},
];
export const achievements = [
 {icon:GraduationCap,title:'Full merit scholarship',text:'Selected on academic merit to complete undergraduate studies in Germany.'},
 {icon:Trophy,title:'Highest team project score',text:'Assembly interpreter: all required and bonus test cases passed.'},
 {icon:Cpu,title:'1.16 academic GPA',text:'German grading scale · Grade A · German International University.'},
];
