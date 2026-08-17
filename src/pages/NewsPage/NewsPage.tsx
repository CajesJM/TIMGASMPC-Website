import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { announcements } from '../../data/content';
import styles from '../shared/ContentPage.module.css';

export function NewsPage() {
  return <><PageHeader eyebrow="News & announcements" title="Stay connected with your cooperative." description="Important member advisories, program openings, training schedules, and stories from across our community." /><section className="section"><div className={`container ${styles.newsList}`}>{announcements.map(item => <article key={item.id}><div className={styles.newsMeta}><span>{item.category}</span><time>{item.date}</time></div><div><h2>{item.title}</h2><p>{item.excerpt}</p><a href={`#news-${item.id}`} onClick={event => event.preventDefault()}>Read full update <ArrowRight size={17} /></a></div></article>)}</div></section></>;
}
