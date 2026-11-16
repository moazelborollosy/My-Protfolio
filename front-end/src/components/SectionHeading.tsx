import { motion } from 'framer-motion';

type Props = {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
};

export default function SectionHeading({ index, eyebrow, title, description }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5 }}
      className="mb-12 grid gap-5 border-t border-white/10 pt-5 md:grid-cols-[0.55fr_1.45fr] md:gap-10"
    >
      <div className="flex items-start gap-3">
        <span className="font-mono text-[10px] text-slate-600">{index}</span>
        <span className="eyebrow">{eyebrow}</span>
      </div>
      <div>
        <h2 className="max-w-3xl font-display text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
