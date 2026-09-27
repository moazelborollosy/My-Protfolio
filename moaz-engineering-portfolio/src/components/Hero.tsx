import { ArrowRight, Code2, Download, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { profileLinks } from '../data/portfolio';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  return (
    <section id="top" className="hero-section">
      <div className="page-shell hero-layout hero-layout--portraitless">
        <div className="hero-copy">
          <p className="availability"><span /> Open to Werkstudent & internship roles</p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.18, ease }}
            className="hero-kicker"
          >
            Berlin, Germany · Mechatronics
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.28, ease }}
            className="hero-title"
          >
            <span>Moaz</span>
            <span className="hero-title-accent">Elborollosy</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.42, ease }}
            className="hero-description"
          >
            I design mechanisms, write control logic, and build software. Mechatronics Engineering student in Berlin, focused on robotics and automation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.54, ease }}
            className="hero-tags"
          >
            <div className="hero-tags-row">
              {['Robotics', 'Automation', 'Embedded Systems'].map((item) => (
                <span key={item} className="hero-skill-pill">{item}</span>
              ))}
            </div>
            <div className="hero-tags-row">
              {['C/C++', 'Python', 'ROS 2', 'SolidWorks'].map((item) => (
                <span key={item} className="hero-skill-pill">{item}</span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.66, ease }}
            className="hero-actions"
          >
            <a href={profileLinks.cv} className="hero-primary-btn" download="Moaz_Elborollosy_CV.pdf">
              <Download size={17} /> Download CV
            </a>
            <a href="#projects" className="hero-secondary-btn">
              View Projects <ArrowRight size={18} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.42, delay: 0.78, ease }}
            className="hero-socials"
          >
            <a href={profileLinks.github} target="_blank" rel="noreferrer" aria-label="GitHub">
              <Code2 size={20} />
            </a>
            <a href={profileLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <span className="hero-linkedin-mark">in</span>
            </a>
            <a href={`mailto:${profileLinks.email}`} aria-label="Email">
              <Mail size={21} />
            </a>
          </motion.div>
        </div>
        <div className="hero-portrait">
          <img
            src={`${import.meta.env.BASE_URL}assets/moaz-portrait-transparent.png`}
            alt="Moaz Elborollosy"
            className="hero-portrait-image"
            width="1024"
            height="1536"
            fetchPriority="high"
          />
        </div>
      </div>

      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.92 }}
        className="hero-scroll"
        aria-label="Scroll to about section"
      >
        <span className="hero-mouse"><i /></span>
        <span>Scroll down</span>
        <i className="hero-scroll-line" />
      </motion.a>
    </section>
  );
}
