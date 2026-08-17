import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import officeImage from "../../assets/images/timgas-office.jpg";
import styles from "../shared/ContentPage.module.css";

export function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact us"
        title="We’re here to help."
        description="Visit the cooperative office or contact our team for membership, service, and application questions."
      />
      <section className="section">
        <div className={`container ${styles.contactGrid}`}>
          <div>
            <p className="eyebrow">Cooperative office</p>
            <h2>Let’s talk about your next step.</h2>
            <div className={styles.contactMethods}>
              <article>
                <MapPin />
                <div>
                  <h3>Visit us</h3>
                  <p>Purok 5, Poblacion, Trinidad, Bohol, Philippines</p>
                </div>
              </article>
              <article>
                <Phone />
                <div>
                  <h3>Call us</h3>
                  <a href="tel:+639171234567">+63 938 224 2376</a>
                </div>
              </article>
              <article>
                <Mail />
                <div>
                  <h3>Email us</h3>
                  <a href="mailto:timgascooperative@gmail.com">
                    timgascooperative@gmail.com
                  </a>
                </div>
              </article>
              <article>
                <Clock3 />
                <div>
                  <h3>Office hours</h3>
                  <p>Monday–Saturday, 8:00 AM–5:00 PM</p>
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
              <MapPin size={22} />
              <div>
                <h2>TIMGAS Cooperative Office</h2>
                <p>Purok 5, Poblacion, Trinidad, Bohol, Philippines</p>
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
    </>
  );
}
