import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import styles from '../shared/ContentPage.module.css';

export function ContactPage() {
  return <><PageHeader eyebrow="Contact us" title="We’re here to help." description="Visit the cooperative office or contact our team for membership, service, and application questions." /><section className="section"><div className={`container ${styles.contactGrid}`}><div><p className="eyebrow">Cooperative office</p><h2>Let’s talk about your next step.</h2><div className={styles.contactMethods}><article><MapPin /><div><h3>Visit us</h3><p>Barangay Timogas, Philippines</p></div></article><article><Phone /><div><h3>Call us</h3><a href="tel:+639171234567">+63 917 123 4567</a></div></article><article><Mail /><div><h3>Email us</h3><a href="mailto:hello@timgasmpc.org">hello@timgasmpc.org</a></div></article><article><Clock3 /><div><h3>Office hours</h3><p>Monday–Friday, 8:00 AM–5:00 PM</p></div></article></div></div><div className={styles.map}><div><MapPin size={42} /><h2>TIMGAS Cooperative Office</h2><p>Interactive map will be connected when the official office location is confirmed.</p></div></div></div></section></>;
}
