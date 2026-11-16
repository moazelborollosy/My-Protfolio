import { Mail, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { profileLinks } from '../data/portfolio';

const navItems = [
  ['Home', '#top'],
  ['About', '#about'],
  ['Projects', '#projects'],
  ['Skills', '#skills'],
  ['Education', '#education'],
  ['Contact', '#contact'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if(event.key==='Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <header className="site-header">
      <nav className="page-shell site-nav" aria-label="Primary navigation">
        <a href="#top" className="site-brand" aria-label="Moaz Elborollosy home">
          <span className="site-brand-mark">ME</span>
          <span className="site-brand-name">Moaz Elborollosy</span>
        </a>

        <div className="site-nav-links">
          {navItems.map(([label, href]) => (
            <a key={label} href={href} >
              {label}
            </a>
          ))}
        </div>

        <div className="site-socials">
          <a href={profileLinks.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="brand-github">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7a11.3 11.3 0 0 0-3.6 22c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.34-3.8-1.34-.52-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.29-5.14-1.25-5.14-5.58 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.44.11-2.99 0 0 .95-.3 3.1 1.16A10.8 10.8 0 0 1 12 6.15c.96 0 1.93.13 2.83.38 2.15-1.46 3.1-1.16 3.1-1.16.61 1.55.23 2.7.11 2.99.72.79 1.16 1.8 1.16 3.03 0 4.34-2.64 5.29-5.16 5.57.4.35.76 1.04.76 2.1v3.1c0 .3.2.65.78.54A11.3 11.3 0 0 0 12 .7Z" /></svg>
          </a>
          <a href={profileLinks.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="brand-linkedin">in</a>
          <a href={`mailto:${profileLinks.email}`} aria-label="Email"><Mail size={21} /></a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="site-menu-button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="site-mobile-menu">
          <div className="page-shell flex flex-col py-3">
            {navItems.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
