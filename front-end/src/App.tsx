import { MotionConfig } from 'framer-motion';
import { useEffect, useState } from 'react';
import About from './components/About';
import Achievements from './components/Achievements';
import AdminPortal from './components/AdminPortal';
import Contact from './components/Contact';
import Education from './components/Education';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import NetworkBackground from './components/NetworkBackground';
import Projects from './components/Projects';
import Skills from './components/Skills';
import { PortfolioProvider } from './context/PortfolioContext';

function checkIsAdminRoute(): boolean {
  return (
    window.location.pathname === '/admin' ||
    window.location.pathname.startsWith('/admin/') ||
    window.location.hash === '#admin' ||
    window.location.hash === '#/admin'
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => checkIsAdminRoute());

  useEffect(() => {
    const onRouteChange = () => setIsAdmin(checkIsAdminRoute());
    window.addEventListener('hashchange', onRouteChange);
    window.addEventListener('popstate', onRouteChange);
    return () => {
      window.removeEventListener('hashchange', onRouteChange);
      window.removeEventListener('popstate', onRouteChange);
    };
  }, []);

  return (
    <PortfolioProvider>
      <MotionConfig reducedMotion="user">
        {isAdmin ? (
          <AdminPortal />
        ) : (
          <div className="relative isolate min-h-screen overflow-x-hidden bg-[#030d17] text-slate-100 selection:bg-sky-300/30 selection:text-white">
            <a className="skip-link" href="#main-content">
              Skip to content
            </a>
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
          </div>
        )}
      </MotionConfig>
    </PortfolioProvider>
  );
}

export default App;
