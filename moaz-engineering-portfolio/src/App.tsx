import { MotionConfig } from 'framer-motion';
import About from './components/About';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Education from './components/Education';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import NetworkBackground from './components/NetworkBackground';
import Projects from './components/Projects';
import Skills from './components/Skills';

function App() {
  return (
    <MotionConfig reducedMotion="user"><div className="relative isolate min-h-screen overflow-x-hidden bg-[#030d17] text-slate-100 selection:bg-sky-300/30 selection:text-white">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <NetworkBackground />
      <div className="relative z-10">
        <Navbar />
        <main id="main-content">
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Education />
          <Achievements />
          <Contact />
        </main>
        <Footer />
      </div>
    </div></MotionConfig>
  );
}

export default App;
