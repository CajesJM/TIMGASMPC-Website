import logo from "../../assets/images/timgas-logo.png";
import styles from "./BrandMark.module.css";

type BrandMarkProps = { compact?: boolean; iconOnly?: boolean; inverse?: boolean };

export function BrandMark({
  compact = false,
  iconOnly = false,
  inverse = false,
}: BrandMarkProps) {
  return (
    <div className={`${styles.brand} ${compact ? styles.compact : ""} ${iconOnly ? styles.iconOnly : ""} ${inverse ? styles.inverse : ""}`}>
      <span className={styles.mark} aria-hidden="true">
        <img src={logo} alt="" />
      </span>
      <span className={styles.copy}>
        <strong>TIMGAS</strong>
        <small>{compact ? "MPC" : "Multi-Purpose Cooperative"}</small>
      </span>
    </div>
  );
}
