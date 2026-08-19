import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import officeCutout from "../../assets/images/timgas-office-footer-cutout.webp";
import { BrandMark } from "../BrandMark/BrandMark";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.officeArtwork} aria-hidden="true">
        <img src={officeCutout} alt="" />
      </div>
      <div className={`container ${styles.grid}`}>
        <div className={styles.summary}>
          <BrandMark inverse />
          <p>
            <i>"Your partner in financial growth."</i>
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <a href="#about">Our cooperative</a>
          <a href="#membership">Membership</a>
          <a href="#news">News & updates</a>
          <a href="#contact">Contact details</a>
          <a href="#application">Application options</a>
        </div>
        <div>
          <h2>Get in touch</h2>
          <span>
            <MapPin size={17} /> Purok 5, Poblacion, Trinidad, Bohol,
            Philippines
          </span>
          <a href="tel:+639382242376">
            <Phone size={17} /> +63 938 224 2376
          </a>
          <a href="mailto:timgascooperative@gmail.com">
            <Mail size={17} /> timgascooperative@gmail.com
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
        </div>
      </div>
    </footer>
  );
}
