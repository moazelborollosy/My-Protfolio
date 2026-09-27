import { motion } from 'framer-motion';
import { skillGroups } from '../data/portfolio';
import SectionHeading from './SectionHeading';

export default function Skills() {
  return (
    <section id="skills" className="section-pad scroll-mt-20 border-y border-white/[0.06] bg-white/[0.012]">
      <div className="page-shell">
        <SectionHeading
          index="03"
          eyebrow="Capabilities"
          title="Tools I use to turn ideas into systems."
          description="Mechanical design, electronics, and software — connected through hands-on academic projects."
        />

        <div className="grid gap-px overflow-hidden border border-white/[0.08] bg-white/[0.08] md:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map(({ title, icon: Icon, skills }, groupIndex) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: groupIndex * 0.06 }}
              className="min-h-[280px] bg-[#090e14] p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center border border-teal-200/15 bg-teal-200/[0.04]">
                  <Icon size={18} className="text-teal-200" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-700">0{groupIndex + 1}</span>
              </div>
              <h3 className="mt-7 font-display text-xl font-semibold tracking-tight text-white">{title}</h3>
              <div className="mt-6 space-y-3">
                {skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-3 border-t border-white/[0.06] pt-3">
                    <span className="h-1 w-1 rounded-full bg-teal-300/80" />
                    <span className="text-sm text-slate-400">{skill}</span>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
          Languages: English C1 · German A2 · Arabic native
        </p>
      </div>
    </section>
  );
}
