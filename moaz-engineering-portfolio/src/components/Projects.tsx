import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { projects, profileLinks } from '../data/portfolio';
import ProjectCard from './ProjectCard';
import SectionHeading from './SectionHeading';
const filters = ['All', 'Mechanical', 'Embedded', 'Software'] as const;
export default function Projects() {
 const [filter, setFilter] = useState<string>('All');
 const shown = projects.filter(p => filter === 'All' || p.category === filter);
 return <section id="projects" className="section-pad page-shell scroll-mt-20">
  <SectionHeading index="02" eyebrow="Selected work" title="Designed. Programmed. Put to the test." description="Six projects across mechanical design, embedded control, and software. Explore the work and my contribution to each." />
  <div className="project-toolbar"><div className="project-filters" aria-label="Filter projects">{filters.map(f => <button type="button" key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</div><span aria-live="polite" className="project-count">{shown.length} projects</span></div>
  <div className="project-grid">{shown.map(p=><ProjectCard key={p.id} project={p} />)}</div>
  <div className="project-footnote"><p>More code, experiments, and problem solving.</p><a href={profileLinks.github} target="_blank" rel="noreferrer">Explore my GitHub <ArrowUpRight size={16}/></a><a href={profileLinks.linkedin} target="_blank" rel="noreferrer">Connect on LinkedIn <ArrowUpRight size={16}/></a></div>
 </section>;
}
