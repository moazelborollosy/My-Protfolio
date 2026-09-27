import { motion } from 'framer-motion';
import { interests } from '../data/portfolio';
import SectionHeading from './SectionHeading';

export default function About() {
  return (
    <section id="about" className="section-pad page-shell scroll-mt-20">
      <SectionHeading
        index="01"
        eyebrow="About"
        title="Curious about how everything works together."
        description="From a linkage in SolidWorks to an instruction running in Java, I enjoy understanding the details and connecting them into a working system."
      />

      <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="panel p-6 sm:p-8"
        >
          <p className="max-w-2xl font-display text-2xl leading-snug tracking-[-0.025em] text-slate-200 sm:text-3xl">
            I’m Moaz, a Mechatronics Engineering student at German International University in Berlin.
          </p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">
            My projects span mechanical assemblies, Arduino control, circuit simulation, and Java software. I’m looking for a working-student role or internship where I can contribute to real engineering problems, learn from an experienced team, and develop my skills in robotics and automation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
          {interests.map(({ label, icon: Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group flex items-center justify-between border border-white/[0.08] bg-white/[0.025] px-4 py-3.5 transition hover:border-teal-200/20 hover:bg-teal-200/[0.025]"
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-teal-200/70" />
                <span className="text-sm text-slate-300">{label}</span>
              </div>
              <span className="font-mono text-[9px] text-slate-700">0{index + 1}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
