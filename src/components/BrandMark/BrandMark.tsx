import logo from "../../assets/images/timgas-logo.png";
import styles from "./BrandMark.module.css";

type BrandMarkProps = { compact?: boolean; inverse?: boolean };

export function BrandMark({
  compact = false,
  inverse = false,
}: BrandMarkProps) {
  return (
    <div className={`${styles.brand} ${inverse ? styles.inverse : ""}`}>
      <span className={styles.mark} aria-hidden="true">
        <img src={logo} alt="" />
      </span>
      <span className={styles.copy}>
        <strong>TIMGAS</strong>
        {!compact && <small>Multi-Purpose Cooperative</small>}
      </span>
    </div>
  );
}
