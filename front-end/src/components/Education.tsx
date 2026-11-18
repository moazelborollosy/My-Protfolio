import { BookOpen, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../context/PortfolioContext';
import SectionHeading from './SectionHeading';

export default function Education() {
  const { education } = usePortfolio();

  return (
    <section id="education" className="section-pad page-shell">
      <SectionHeading
        index="04"
        eyebrow="Education"
        title="A strong foundation. A practical mindset."
      />

      <div className="space-y-6">
        {education.map((edu, index) => (
          <motion.div
            key={edu.sk || `${edu.institution}-${index}`}
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
                  <p className="font-mono text-5xl font-semibold tracking-[-0.06em] text-white">
                    {edu.startYear}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-600">
                    Start year
                  </p>
                </div>
              </div>
            </div>
            <div className="p-7 sm:p-9 lg:p-12">
              <p className="eyebrow">{edu.dateRange}</p>
              <h3 className="mt-4 font-display text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                {edu.institution}{' '}
                {edu.institutionShort && <span className="text-slate-500">{edu.institutionShort}</span>}
              </h3>
              <p className="mt-3 font-display text-xl text-slate-300">{edu.degree}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                {edu.location && (
                  <span className="chip">
                    <MapPin size={12} className="mr-1.5" /> {edu.location}
                  </span>
                )}
                {edu.gpa && <span className="chip">{edu.gpa}</span>}
              </div>
              {edu.coursework && (
                <p className="mt-7 max-w-2xl text-sm leading-6 text-slate-400">{edu.coursework}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
