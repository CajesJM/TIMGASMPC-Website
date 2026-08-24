import { X } from "lucide-react";
import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./MembershipApplicationModal.module.css";

type MembershipApplicationModalProps = {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
};

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function MembershipApplicationModal({
  children,
  open,
  onClose,
}: MembershipApplicationModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  const keepFocusInside = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter((element) => !element.hasAttribute("hidden"));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div
      className={styles.backdrop}
      hidden={!open}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-modal-title"
        aria-describedby="membership-modal-description"
        onKeyDown={keepFocusInside}
      >
        <header className={styles.header}>
          <div>
            <p>Membership application</p>
            <h2 id="membership-modal-title">Apply online to TIMGAS MPC</h2>
            <span id="membership-modal-description">
              Complete each section, review your information, then submit it
              privately to the cooperative manager.
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close online application"
          >
            <X aria-hidden="true" />
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
