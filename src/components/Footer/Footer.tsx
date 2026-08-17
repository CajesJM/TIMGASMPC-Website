import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "../BrandMark/BrandMark";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.summary}>
          <BrandMark inverse />
          <p>
            Building sustainable livelihoods through cooperation, responsible
            finance, and shared opportunity.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link to="/about">Our cooperative</Link>
          <Link to="/services">Member services</Link>
          <Link to="/news">News & updates</Link>
          <Link to="/apply">Membership application</Link>
        </div>
        <div>
          <h2>Get in touch</h2>
          <span>
            <MapPin size={17} /> Barangay Timogas, Philippines
          </span>
          <a href="tel:+639171234567">
            <Phone size={17} /> +63 917 123 4567
          </a>
          <a href="mailto:hello@timgasmpc.org">
            <Mail size={17} /> hello@timgasmpc.org
          </a>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <small>
          © {new Date().getFullYear()} TIMGAS MPC. All rights reserved.
        </small>
        <div>
          <a href="#" aria-label="TIMGAS social page">
            <Globe2 size={18} />
          </a>
          <Link to="/manager/login">Manager portal</Link>
        </div>
      </div>
    </footer>
  );
}
