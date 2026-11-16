import { ArrowUpRight, Check, Copy, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { profileLinks } from '../data/portfolio';
import SectionHeading from './SectionHeading';
export default function Contact() {
 const [copyStatus,setCopyStatus]=useState('');
 async function copyEmail(){try {await navigator.clipboard.writeText(profileLinks.email);setCopyStatus('Email copied');}catch{setCopyStatus('Please select and copy the email address below.');}}
 return <section id="contact" className="section-pad scroll-mt-20 border-t border-white/10 bg-[#080d13]"><div className="page-shell">
 <SectionHeading index="06" eyebrow="Let’s connect" title="Have an engineering challenge in mind?" description="I’m looking for Werkstudent and internship opportunities in mechanical design, robotics, automation, and hardware development."/>
 <div className="contact-panel"><div><p className="availability"><span/>Open to opportunities</p><h3>Let’s start a conversation.</h3><p className="contact-location"><MapPin size={16}/> Berlin, Germany</p><a className="contact-email" href={`mailto:${profileLinks.email}`}>{profileLinks.email}</a></div>
 <div className="contact-actions"><a className="hero-primary-btn" href={`mailto:${profileLinks.email}?subject=Engineering%20opportunity`}><Mail size={18}/>Email me <ArrowUpRight size={17}/></a><button className="secondary-btn" onClick={copyEmail} type="button">{copyStatus==='Email copied'?<Check size={16}/>:<Copy size={16}/>}Copy email address</button><p className="copy-status" role="status">{copyStatus}</p></div></div>
 <div className="contact-links"><a href={profileLinks.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={16}/></a><a href={profileLinks.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={16}/></a><a href={profileLinks.cv} download="Moaz_Elborollosy_CV.pdf">Download CV <ArrowUpRight size={16}/></a></div>
 </div></section>;
}
