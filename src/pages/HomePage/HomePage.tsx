import { ArrowRight, CheckCircle2, ChevronRight, Download, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { announcements, principles, services } from '../../data/content';
import heroImage from '../../assets/images/timgas-farmers-hero.jpg';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <img className={styles.heroImage} src={heroImage} alt="Cooperative farmers inspecting rice during harvest season" />
        <div className={styles.heroOverlay} />
        <div className={`container ${styles.heroContent}`}>
          <p className={styles.kicker}>Rooted in community since 2008</p>
          <h1>Growing stronger,<br /><em>together.</em></h1>
          <p>We help members build secure livelihoods through responsible financial services, farm support, and the power of cooperation.</p>
          <div className={styles.heroActions}><Button to="/apply" variant="light">Become a member <ArrowRight size={18} /></Button><Button to="/about" variant="secondary" className={styles.heroSecondary}>Discover our story</Button></div>
        </div>
        <div className={styles.heroStats}>
          <div className="container"><p><strong>1,200+</strong><span>Active members</span></p><p><strong>18 years</strong><span>Serving together</span></p><p><strong>6</strong><span>Core services</span></p></div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.intro}`}>
          <div><p className="eyebrow">Your cooperative advantage</p><h2>Opportunity grows when we grow it together.</h2></div>
          <div><p>At TIMGAS, members pool their strengths to access better financial tools, productive resources, and fair opportunities. Every service is designed around one goal: helping our community thrive.</p><Link className={styles.textLink} to="/about">How our cooperative works <ArrowRight size={17} /></Link></div>
        </div>
        <div className={`container ${styles.serviceGrid}`}>
          {services.slice(0, 3).map(({ icon: Icon, title, description }) => <article className={styles.service} key={title}><Icon aria-hidden="true" /><span>0{services.findIndex((item) => item.title === title) + 1}</span><h3>{title}</h3><p>{description}</p><Link to="/services" aria-label={`Learn more about ${title}`}><ChevronRight /></Link></article>)}
        </div>
      </section>

      <section className={styles.impact}>
        <div className={`container ${styles.impactGrid}`}>
          <div className={styles.impactPhoto}><img src={heroImage} alt="Rice farmers working together in the field" /><div><strong>₱32M+</strong><span>in member loans supported</span></div></div>
          <div className={styles.impactCopy}><p className="eyebrow">Real impact, close to home</p><h2>More than finance. A partner in every season.</h2><p>Our progress is measured in livelihoods made stronger, families given more choices, and local enterprises that can confidently move forward.</p><ul><li><CheckCircle2 /> Fair, transparent member services</li><li><CheckCircle2 /> Practical support from people who understand local needs</li><li><CheckCircle2 /> Shared returns reinvested in members and community</li></ul><Button to="/services">Explore member services <ArrowRight size={18} /></Button></div>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.valuesHeader}`}><div><p className="eyebrow">What guides us</p><h2>Built on trust. Driven by purpose.</h2></div><p>Our cooperative principles shape every decision—from how we serve one member to how we plan for the whole community.</p></div>
        <div className={`container ${styles.principles}`}>{principles.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className={styles.testimonial}><div className={`container ${styles.quote}`}><Quote aria-hidden="true" /><blockquote>“Through the cooperative, I was able to prepare for planting on time and sell our harvest with more confidence. You feel that you are building something with your neighbors, not doing it alone.”</blockquote><p><strong>Maria L.</strong><span>Member-farmer since 2016</span></p></div></section>

      <section className="section">
        <div className={`container ${styles.newsHeading}`}><div><p className="eyebrow">Latest from TIMGAS</p><h2>News & notices</h2></div><Link className={styles.textLink} to="/news">View all updates <ArrowRight size={17} /></Link></div>
        <div className={`container ${styles.newsGrid}`}>{announcements.map((item) => <article key={item.id}><div><span>{item.category}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.excerpt}</p><Link to="/news">Read update <ArrowRight size={16} /></Link></article>)}</div>
      </section>

      <section className={styles.download}><div className={`container ${styles.downloadInner}`}><div><p className="eyebrow">Ready to get started?</p><h2>Your cooperative journey begins here.</h2><p>Apply online or download the membership form and visit our office. Our team is ready to guide you.</p></div><div><Button to="/apply" variant="light">Apply online <ArrowRight size={18} /></Button><a href="#" onClick={(event) => event.preventDefault()}><Download size={18} /> Download application form</a></div></div></section>
    </>
  );
}
