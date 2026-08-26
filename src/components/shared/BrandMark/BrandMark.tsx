import styles from "@/styles/shared/components/BrandMark.module.css";

const logo = "/timgas-logo-256.webp";

type BrandMarkProps = {
  compact?: boolean;
  iconOnly?: boolean;
  inverse?: boolean;
};

export function BrandMark({
  compact = false,
  iconOnly = false,
  inverse = false,
}: BrandMarkProps) {
  return (
    <div
      className={`${styles.brand} ${compact ? styles.compact : ""} ${iconOnly ? styles.iconOnly : ""} ${inverse ? styles.inverse : ""}`}
    >
      <span className={styles.mark} aria-hidden="true" data-logo-mark>
        <img src={logo} alt="" />
      </span>
      <span className={styles.copy}>
        <strong>TIMGAS</strong>
        <small>{compact ? "MPC" : "Multi-Purpose Cooperative"}</small>
      </span>
    </div>
  );
}
