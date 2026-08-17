import styles from "./HeroMarquee.module.css";

type HeroMarqueeProps = {
  text: string;
};

export function HeroMarquee({ text }: HeroMarqueeProps) {
  return (
    <div
      className={styles.marquee}
      data-testid="hero-marquee"
      role="group"
      aria-label="Cooperative identity"
    >
      <span className="srOnly">{text}</span>
      <div className={styles.viewport}>
        <div className={styles.track} aria-hidden="true">
          {[0, 1].map((sequence) => (
            <div className={styles.sequence} key={sequence}>
              {[0, 1, 2].map((item) => (
                <span className={styles.group} key={item}>
                  <span className={styles.text}>{text}</span>
                  <span className={styles.marker}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
