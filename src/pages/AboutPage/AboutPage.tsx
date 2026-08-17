import { Button } from '../../components/Button/Button';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { principles } from '../../data/content';
import styles from '../shared/ContentPage.module.css';

export function AboutPage() {
  return <>
    <PageHeader eyebrow="About TIMGAS" title="Progress with people at the center." description="We are a member-owned cooperative committed to building stronger livelihoods, responsible growth, and lasting community value." />
    <section className="section"><div className={`container ${styles.split}`}><div><p className="eyebrow">Our story</p><h2>Local roots. A shared direction.</h2></div><div><p className={styles.lead}>TIMGAS Multi-Purpose Cooperative began with a simple belief: people can achieve more when resources, responsibility, and opportunity are shared.</p><p>From a small group of community members, we have grown into a trusted local institution serving farmers, families, and entrepreneurs. We remain guided by the same democratic values that shaped our beginning.</p><div className={styles.facts}><div><strong>2008</strong><span>Year established</span></div><div><strong>1,200+</strong><span>Active cooperative members</span></div><div><strong>100%</strong><span>Member-owned and locally governed</span></div></div></div></div></section>
    <section className={`section ${styles.muted}`}><div className={`container ${styles.threeGrid}`}><article><p className="eyebrow">Our mission</p><h3>Make opportunity more accessible.</h3><p>Deliver responsible services and programs that improve members’ economic and social well-being.</p></article><article><p className="eyebrow">Our vision</p><h3>A resilient cooperative community.</h3><p>Become a trusted model of inclusive growth, good governance, and sustainable local enterprise.</p></article><article><p className="eyebrow">Our promise</p><h3>Serve with fairness and care.</h3><p>Protect members’ interests through transparency, integrity, and accountable leadership.</p></article></div></section>
    <section className="section"><div className="container"><p className="eyebrow">Cooperative principles</p><h2>Values we put into practice.</h2><div className={styles.threeGrid}>{principles.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>
    <section className={styles.cta}><div className="container"><div><h2>There is a place for you here.</h2><p>Discover what membership can help you build.</p></div><Button to="/apply" variant="light">Start your application</Button></div></section>
  </>;
}
