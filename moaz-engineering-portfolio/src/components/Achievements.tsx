import { motion } from 'framer-motion';
import { achievements } from '../data/portfolio';
import SectionHeading from './SectionHeading';

export default function Achievements() {
  return (
    <section className="section-pad page-shell">
      <SectionHeading
        index="05"
        eyebrow="Achievements"
        title="Academic highlights."
      />

      <div className="grid gap-3 md:grid-cols-3">
        {achievements.map(({ icon: Icon, title, text }, index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="panel p-6 sm:p-7"
          >
            <div className="flex items-center justify-between">
              <Icon size={19} className="text-teal-200/70" />
              
            </div>
            <h3 className="mt-8 font-display text-xl font-semibold text-white">{title}</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">{text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
