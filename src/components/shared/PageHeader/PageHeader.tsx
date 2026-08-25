import styles from "@/styles/shared/components/PageHeader.module.css";
type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  headingLevel?: 1 | 2;
  compact?: boolean;
  centered?: boolean;
};
export function PageHeader({
  eyebrow,
  title,
  description,
  headingLevel = 1,
  compact = false,
  centered = false,
}: PageHeaderProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section
      className={`${styles.header} ${compact ? styles.compact : ""} ${centered ? styles.centered : ""}`}
    >
      <div className={`container ${styles.inner}`}>
        <p className="eyebrow">{eyebrow}</p>
        <Heading>{title}</Heading>
        <p>{description}</p>
      </div>
    </section>
  );
}
