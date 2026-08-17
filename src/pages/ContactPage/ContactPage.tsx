import { Clock3, Mail, MapPin, Phone } from "lucide-react";
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
                <p>
                  The official map pin will be added after the manager confirms
                  the complete address.
                </p>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
