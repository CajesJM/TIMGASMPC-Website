import styles from "./PageHeader.module.css";
type PageHeaderProps = { eyebrow: string; title: string; description: string };
export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
