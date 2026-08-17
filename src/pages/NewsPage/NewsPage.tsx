import { ChevronDown } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { announcements } from '../../data/content';
import styles from '../shared/ContentPage.module.css';

export function NewsPage() {
  return <><PageHeader eyebrow="News & announcements" title="Stay connected with your cooperative." description="Important member advisories, program openings, training schedules, and stories from across our community." /><section className="section"><div className={`container ${styles.newsList}`}>{announcements.map(item => <article key={item.id}><div className={styles.newsMeta}><span>{item.category}</span><time>{item.date}</time></div><div><h2>{item.title}</h2><p>{item.excerpt}</p><details className={styles.readMore}><summary>Read full update <ChevronDown size={17} /></summary><p className={styles.readMoreBody}>{item.body}</p></details></div></article>)}</div></section></>;
}
