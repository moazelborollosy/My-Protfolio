import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { Project } from '../types';
export default function ProjectCard({project}: {project: Project}) {
 const Icon = project.icon;
 return <article className={`project-card project-card--${project.id}`}>
  <div className="project-card-top"><span>{project.accent}</span><Icon size={24} strokeWidth={1.3}/></div>
  <h3>{project.title}</h3><p className="project-description">{project.description}</p>
  <div className="project-tech">{project.technologies.map(t=><span className="chip" key={t}>{t}</span>)}</div>
  <details className="project-details"><summary>Explore the project <ChevronDown size={16}/></summary><div><h4>My contribution</h4><p>{project.contribution}</p><h4>Outcome</h4><p>{project.outcome}</p></div></details>
  {project.github && <a className="project-source" href={project.github} target="_blank" rel="noreferrer">View source on GitHub <ArrowUpRight size={15}/></a>}
 </article>;
}
