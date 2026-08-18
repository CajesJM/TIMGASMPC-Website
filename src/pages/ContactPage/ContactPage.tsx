import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import officeImage from "../../assets/images/timgas-office.jpg";
import styles from "../shared/ContentPage.module.css";

export function ContactPage() {
  return (
    <div id="contact">
      <PageHeader
        headingLevel={2}
        eyebrow="Contact TIMGAS MPC"
        title="Connect with the cooperative office."
        description="Use the confirmed office address, phone number, or email addresses below for membership and service inquiries."
      />

      <section className={styles.section}>
        <div className={`container ${styles.contactGrid}`}>
          <div className={styles.contactPanel}>
            <header className={styles.sectionHeading}>
              <p className="eyebrow">Official contact details</p>
              <h2>Plan your inquiry or visit.</h2>
            </header>
            <div className={styles.contactMethods}>
              <article>
                <MapPin aria-hidden="true" />
                <div>
                  <h3>Office address</h3>
                  <p>Purok 5, Poblacion, Trinidad, Bohol, Philippines</p>
                </div>
              </article>
              <article>
                <Phone aria-hidden="true" />
                <div>
                  <h3>Phone</h3>
                  <a href="tel:+639382242376">+63 938 224 2376</a>
                </div>
              </article>
              <article>
                <Mail aria-hidden="true" />
                <div>
                  <h3>Email</h3>
                  <a href="mailto:mpctimgas@yahoo.com">mpctimgas@yahoo.com</a>
                  <a href="mailto:timgascooperative@gmail.com">
                    timgascooperative@gmail.com
                  </a>
                </div>
              </article>
            </div>
          </div>

          <figure className={styles.officePhoto}>
            <img
              src={officeImage}
              alt="Front entrance of the TIMGAS Multi-Purpose Cooperative office"
            />
            <figcaption>
              <MapPin size={20} aria-hidden="true" />
              <div>
                <h2>TIMGAS Cooperative Office</h2>
                <p>Purok 5, Poblacion, Trinidad, Bohol</p>
              </div>
            </figcaption>
          </figure>

          <div className={styles.mapWrap}>
            <iframe
              title="Map of the TIMGAS Cooperative Office in Trinidad, Bohol"
              src="https://www.google.com/maps?q=Purok%205%2C%20Poblacion%2C%20Trinidad%2C%20Bohol%2C%20Philippines&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Purok%205%2C%20Poblacion%2C%20Trinidad%2C%20Bohol%2C%20Philippines"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
