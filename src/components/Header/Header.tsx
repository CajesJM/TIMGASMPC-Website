import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { BrandMark } from "../BrandMark/BrandMark";
import { Button } from "../Button/Button";
import styles from "./Header.module.css";

const navItems = [
  ["/", "Home"],
  ["/about", "About"],
  ["/membership", "Membership"],
  ["/services", "Services"],
  ["/news", "News"],
  ["/contact", "Contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link
          to="/"
          className={styles.logo}
          onClick={closeMenu}
          aria-label="TIMGAS home"
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
          {navItems.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              {label}
            </NavLink>
          ))}
          <Button to="/apply" className={styles.apply}>
            Apply now
          </Button>
        </nav>
      </div>
    </header>
  );
}
