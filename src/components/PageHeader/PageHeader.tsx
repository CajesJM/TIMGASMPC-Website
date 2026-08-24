import styles from "./PageHeader.module.css";
type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  headingLevel?: 1 | 2;
  compact?: boolean;
};
export function PageHeader({
  eyebrow,
  title,
  description,
  headingLevel = 1,
  compact = false,
}: PageHeaderProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section className={`${styles.header} ${compact ? styles.compact : ""}`}>
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">{eyebrow}</p>
        <Heading>{title}</Heading>
        <p>{description}</p>
      </div>
    </section>
  );
}
