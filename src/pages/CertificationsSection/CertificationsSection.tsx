import { CalendarDays, FileBadge2, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchPublishedPosts } from "../../features/posts/publicPosts";
import {
  formatPostDate,
  type PublishedPost,
} from "../../features/posts/postTypes";
import styles from "./CertificationsSection.module.css";

export function CertificationsSection() {
  const [certifications, setCertifications] = useState<PublishedPost[]>([]);
  const [selectedCertificate, setSelectedCertificate] =
    useState<PublishedPost | null>(null);

  useEffect(() => {
    let active = true;
    void fetchPublishedPosts()
      .then((posts) => {
        if (active)
          setCertifications(
            posts.filter((post) => post.category === "certification"),
          );
      })
      .catch((error) =>
        console.error("Unable to load TIMGAS certifications.", error),
      );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCertificate) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCertificate(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [selectedCertificate]);

  if (certifications.length === 0) return null;

  return (
    <section
      id="certifications"
      className={styles.section}
      aria-labelledby="certifications-heading"
    >
      <div className="container">
        <header className={styles.heading}>
          <div>
            <p className="eyebrow">Certifications &amp; accreditation</p>
            <h2 id="certifications-heading">
              Registered, recognized and trusted.
            </h2>
          </div>
          <p>
            Official certificates published by TIMGAS MPC for member and public
            reference.
          </p>
        </header>

        <div className={styles.grid}>
          {certifications.map((certificate) => (
            <article className={styles.card} key={certificate.id}>
              <div className={styles.preview}>
                {certificate.photoUrl ? (
                  <button
                    type="button"
                    onClick={() => setSelectedCertificate(certificate)}
                    aria-label={`View ${certificate.title}`}
                  >
                    <img
                      src={certificate.photoUrl}
                      alt={`${certificate.title} certificate`}
                      loading="lazy"
                    />
                    <span>
                      <Maximize2 aria-hidden="true" /> View certificate
                    </span>
                  </button>
                ) : (
                  <div className={styles.placeholder}>
                    <FileBadge2 aria-hidden="true" />
                    <span>Certificate record</span>
                  </div>
                )}
              </div>
              <div className={styles.content}>
                <time dateTime={certificate.date}>
                  <CalendarDays aria-hidden="true" />{" "}
                  {formatPostDate(certificate.date)}
                </time>
                <h3>{certificate.title}</h3>
                <p>{certificate.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedCertificate?.photoUrl && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="certificate-preview-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setSelectedCertificate(null);
          }}
        >
          <div className={styles.modalPanel}>
            <div className={styles.modalHeader}>
              <div>
                <p>Certificate preview</p>
                <h2 id="certificate-preview-title">
                  {selectedCertificate.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCertificate(null)}
                aria-label="Close certificate preview"
              >
                <X />
              </button>
            </div>
            <img
              src={selectedCertificate.photoUrl}
              alt={`${selectedCertificate.title} certificate, enlarged view`}
            />
          </div>
        </div>
      )}
    </section>
  );
}
