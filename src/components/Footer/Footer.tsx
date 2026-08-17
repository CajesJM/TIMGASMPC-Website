import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "../BrandMark/BrandMark";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grass} aria-hidden="true">
        <svg
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <g id="tuftBack">
              <path d="M-4 96 C-14 72 -20 52 -22 34 C-10 56 -4 74 0 96 Z" />
              <path d="M0 96 C4 70 8 50 12 32 C18 52 14 72 8 96 Z" />
              <path d="M6 96 C16 74 22 56 26 42 C30 62 24 78 14 96 Z" />
            </g>
            <g id="tuftFront">
              <path d="M-2 96 C-10 64 -14 38 -14 14 C-4 40 0 64 2 96 Z" />
              <path d="M0 96 C6 56 8 28 10 6 C14 30 12 60 6 96 Z" />
              <path d="M4 96 C14 62 18 40 20 20 C26 44 22 66 12 96 Z" />
            </g>
          </defs>
          <g fill="#0c2f23">
            <use href="#tuftBack" x="10" />
            <use href="#tuftBack" x="130" />
            <use href="#tuftBack" x="250" />
            <use href="#tuftBack" x="370" />
            <use href="#tuftBack" x="490" />
            <use href="#tuftBack" x="610" />
            <use href="#tuftBack" x="730" />
            <use href="#tuftBack" x="850" />
            <use href="#tuftBack" x="970" />
            <use href="#tuftBack" x="1090" />
            <use href="#tuftBack" x="1210" />
            <use href="#tuftBack" x="1330" />
            <use href="#tuftBack" x="1430" />
          </g>
          <g fill="#1f5c43">
            <use href="#tuftFront" x="40" />
            <use href="#tuftFront" x="160" />
            <use href="#tuftFront" x="280" />
            <use href="#tuftFront" x="400" />
            <use href="#tuftFront" x="520" />
            <use href="#tuftFront" x="640" />
            <use href="#tuftFront" x="760" />
            <use href="#tuftFront" x="880" />
            <use href="#tuftFront" x="1000" />
            <use href="#tuftFront" x="1120" />
            <use href="#tuftFront" x="1240" />
            <use href="#tuftFront" x="1360" />
            <use href="#tuftFront" x="1480" />
          </g>
        </svg>
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
          <Link to="/about">Our cooperative</Link>
          <Link to="/membership">Membership</Link>
          <Link to="/services">Member services</Link>
          <Link to="/news">News & updates</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/apply">Membership application</Link>
        </div>
        <div>
          <h2>Get in touch</h2>
          <span>
            <MapPin size={17} /> Purok 5, Poblacion, Trinidad, Bohol,
            Philippines
          </span>
          <a href="tel:+639171234567">
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
