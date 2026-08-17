import { Sprout } from "lucide-react";
import styles from "./BrandMark.module.css";

type BrandMarkProps = { compact?: boolean; inverse?: boolean };

export function BrandMark({
  compact = false,
  inverse = false,
}: BrandMarkProps) {
  return (
    <div className={`${styles.brand} ${inverse ? styles.inverse : ""}`}>
      <span className={styles.mark} aria-hidden="true">
        <Sprout size={25} strokeWidth={2.2} />
      </span>
      <span className={styles.copy}>
        <strong>TIMGAS</strong>
        {!compact && <small>Multi-Purpose Cooperative</small>}
      </span>
    </div>
  );
}
