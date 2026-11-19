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
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';

function checkIsAdminRoute(): boolean {
  return (
    window.location.pathname === '/admin' ||
    window.location.pathname.startsWith('/admin/') ||
    window.location.hash === '#admin' ||
    window.location.hash === '#/admin'
  );
}

function SeoHeadManager({ isAdmin }: { isAdmin: boolean }) {
  const { profile, education, skillGroups } = usePortfolio();

  useEffect(() => {
    const origin = window.location.origin;
    const isNonProdHost =
      window.location.hostname.startsWith('staging-') ||
      window.location.hostname.endsWith('.cloudfront.net') ||
      window.location.hostname === 'localhost';

    const robotsMeta = document.getElementById('meta-robots');
    if (robotsMeta) {
      robotsMeta.setAttribute(
        'content',
        isAdmin || isNonProdHost ? 'noindex, nofollow' : 'index, follow'
      );
    }

    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    const pageTitle = isAdmin
      ? `Admin CMS | ${fullName}`
      : `${fullName} | Mechatronics Engineering`;
    document.title = pageTitle;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el && value) el.setAttribute(attr, value);
    };

    const portraitUrl = `${origin}/assets/profile-image.jpeg`;
    setMeta('link[rel="canonical"]', 'href', `${origin}/`);
    setMeta('meta[name="description"]', 'content', profile.heroDescription);
    setMeta('meta[name="author"]', 'content', fullName);
    setMeta('meta[property="og:url"]', 'content', `${origin}/`);
    setMeta('meta[property="og:title"]', 'content', `${fullName} | Mechatronics Engineering Portfolio`);
    setMeta('meta[property="og:description"]', 'content', profile.heroDescription);
    setMeta('meta[property="og:image"]', 'content', portraitUrl);
    setMeta('meta[name="twitter:title"]', 'content', `${fullName} | Mechatronics Engineering Portfolio`);
    setMeta('meta[name="twitter:description"]', 'content', profile.heroDescription);
    setMeta('meta[name="twitter:image"]', 'content', portraitUrl);

    const ldScript = document.getElementById('ld-json-person');
    if (ldScript && !isAdmin) {
      const allSkills = skillGroups.flatMap((g) => g.skills);
      const primaryEdu = education[0];
      ldScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: fullName,
        url: `${origin}/`,
        image: portraitUrl,
        jobTitle: 'Mechatronics Engineering Student',
        description: profile.heroDescription,
        email: `mailto:${profile.links.email}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: profile.contactLocation || 'Berlin, Germany',
        },
        ...(primaryEdu
          ? {
              alumniOf: {
                '@type': 'CollegeOrUniversity',
                name: `${primaryEdu.institution} ${primaryEdu.institutionShort}`.trim(),
              },
            }
          : {}),
        ...(allSkills.length > 0 ? { knowsAbout: allSkills } : {}),
        sameAs: [profile.links.github, profile.links.linkedin].filter(Boolean),
      });
    }
  }, [isAdmin, profile, education, skillGroups]);

  return null;
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
      <SeoHeadManager isAdmin={isAdmin} />
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
