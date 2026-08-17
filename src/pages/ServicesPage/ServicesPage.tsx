import { Button } from '../../components/Button/Button';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { services } from '../../data/content';
import styles from '../shared/ContentPage.module.css';

export function ServicesPage() {
  return <>
    <PageHeader eyebrow="Member services" title="Practical support for every stage." description="From everyday savings to productive financing and farm support, our services are designed around the real needs of members." />
    <section className="section"><div className={`container ${styles.serviceList}`}>{services.map(({ icon: Icon, title, description }) => <article className={styles.serviceItem} key={title}><Icon /><div><h2>{title}</h2><p>{description}</p></div></article>)}</div></section>
    <section className={`section ${styles.muted}`}><div className="container"><p className="eyebrow">How to access services</p><h2>Three straightforward steps.</h2><div className={styles.steps}><div><h3>Become a member</h3><p>Complete the application and provide the basic membership requirements.</p></div><div><h3>Attend orientation</h3><p>Learn your rights, responsibilities, and the services available to you.</p></div><div><h3>Choose what fits</h3><p>Speak with our team to find the right program for your current goals.</p></div></div></div></section>
    <section className={styles.cta}><div className="container"><div><h2>Questions about eligibility?</h2><p>Our cooperative team will help you understand your options.</p></div><Button to="/contact" variant="light">Talk to our team</Button></div></section>
  </>;
}
