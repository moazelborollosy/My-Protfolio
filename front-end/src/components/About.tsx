import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import SectionHeading from './SectionHeading';

export default function About() {
  const { profile, interests } = usePortfolio();

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
            {profile.aboutHeadline}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400">{profile.aboutBody}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
          {interests.map(({ label, icon: Icon, sk }, index) => (
            <motion.div
              key={sk || label}
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
              <span className="font-mono text-[9px] text-slate-700">
                {String(index + 1).padStart(2, '0')}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
