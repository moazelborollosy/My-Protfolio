import { BookOpen, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';

export default function Education() {
  return (
    <section id="education" className="section-pad page-shell">
      <SectionHeading
        index="04"
        eyebrow="Education"
        title="A strong foundation. A practical mindset."
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="panel grid overflow-hidden md:grid-cols-[0.34fr_0.66fr]"
      >
        <div className="engineering-grid relative min-h-[220px] border-b border-white/[0.08] p-7 md:min-h-[300px] md:border-b-0 md:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(94,234,212,.08),transparent_45%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <BookOpen size={30} strokeWidth={1.3} className="text-teal-200" />
            <div>
              <p className="font-mono text-5xl font-semibold tracking-[-0.06em] text-white">2024</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">Start year</p>
            </div>
          </div>
        </div>
        <div className="p-7 sm:p-9 lg:p-12">
          <p className="eyebrow">September 2024 — July 2028 (expected)</p>
          <h3 className="mt-4 font-display text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            German International University <span className="text-slate-500">(GIU)</span>
          </h3>
          <p className="mt-3 font-display text-xl text-slate-300">B.Sc. in Mechatronics Engineering</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="chip"><MapPin size={12} className="mr-1.5" /> Berlin, Germany</span>
            <span className="chip">GPA 1.16 · German scale</span>
          </div>
          <p className="mt-7 max-w-2xl text-sm leading-6 text-slate-400">
            Relevant coursework: Kinematics & Robotics, Control Systems, Signals & Systems, Embedded Systems, Microcontroller Programming, and Computer Architecture.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
