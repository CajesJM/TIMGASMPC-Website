import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/shared/BrandMark/BrandMark";
import { Button } from "@/components/shared/Button/Button";
import styles from "@/styles/user/components/layout/Header.module.css";

const navItems = [
  ["#home", "Home"],
  ["#about", "About"],
  ["#membership", "Membership"],
  ["#news", "News"],
  ["#contact", "Contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(
    () => window.location.hash.slice(1) || "home",
  );
  const navigationTarget = useRef<string | null>(null);
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const sectionIds = navItems.map(([href]) => href.slice(1));
    let frame = 0;

    const updateActiveSection = () => {
      if (navigationTarget.current) {
        setActiveSection(navigationTarget.current);
        return;
      }

      const marker = Math.min(window.innerHeight * 0.3, 260);
      const sections = sectionIds
        .map((id) => ({ id, element: document.getElementById(id) }))
        .filter((section): section is { id: string; element: HTMLElement } =>
          Boolean(section.element),
        );
      const containingSection = sections.find(({ element }) => {
        const bounds = element.getBoundingClientRect();
        return bounds.top <= marker && bounds.bottom > marker;
      });
      const nearestSection = sections.reduce<
        (typeof sections)[number] | undefined
      >((nearest, section) => {
        if (!nearest) return section;
        const distance = Math.abs(
          section.element.getBoundingClientRect().top - marker,
        );
        const nearestDistance = Math.abs(
          nearest.element.getBoundingClientRect().top - marker,
        );
        return distance < nearestDistance ? section : nearest;
      }, undefined);

      setActiveSection((containingSection ?? nearestSection)?.id ?? "home");
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveSection);
    };
    const finishNavigation = () => {
      navigationTarget.current = null;
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("scrollend", finishNavigation);
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("scrollend", finishNavigation);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);
  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        <Link
          to="/"
          className={styles.logo}
          onClick={closeMenu}
          aria-label="TIMGAS home"
          data-logo-target
        >
          <BrandMark />
        </Link>
        <button
          className={styles.menuButton}
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="primary-nav"
          className={`${styles.nav} ${open ? styles.open : ""}`}
          aria-label="Primary navigation"
        >
          {navItems.map(([to, label]) => {
            const sectionId = to.slice(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={to}
                href={to}
                onClick={() => {
                  navigationTarget.current = sectionId;
                  setActiveSection(sectionId);
                  closeMenu();
                }}
                className={isActive ? styles.active : undefined}
                aria-current={isActive ? "location" : undefined}
              >
                {label}
              </a>
            );
          })}
          <Button to="/#application" className={styles.apply}>
            Apply now
          </Button>
        </nav>
      </div>
    </header>
  );
}
