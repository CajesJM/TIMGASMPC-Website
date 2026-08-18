import { Bell, Mail, Phone } from "lucide-react";
import { Button } from "../../components/Button/Button";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import styles from "../shared/ContentPage.module.css";

export function NewsPage() {
  return (
    <div id="news">
      <PageHeader
        headingLevel={2}
        eyebrow="News and notices"
        title="Verified updates from TIMGAS MPC."
        description="Official announcements will be published here after they are confirmed by the cooperative."
      />

      <section className={styles.section}>
        <div className={`container ${styles.emptyNews}`}>
          <Bell aria-hidden="true" />
          <div>
            <p className="eyebrow">Current status</p>
            <h2>No official announcement has been posted yet.</h2>
            <p>
              For current advisories, schedules, program availability, and
              member notices, contact or visit the TIMGAS MPC office directly.
            </p>
            <div className={styles.contactLinks}>
              <a href="tel:+639382242376">
                <Phone size={17} /> +63 938 224 2376
              </a>
              <a href="mailto:timgascooperative@gmail.com">
                <Mail size={17} /> timgascooperative@gmail.com
              </a>
            </div>
          </div>
          <Button to="/#contact">View contact details</Button>
        </div>
      </section>
    </div>
  );
}
