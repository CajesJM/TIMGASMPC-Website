import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  CircleCheck,
  CircleX,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "../../../components/BrandMark/BrandMark";
import type { ManagerIdentity } from "../../../components/admin/AdminProfileManager/AdminProfileManager";
import type {
  ShowToast,
  ToastTone,
} from "../../../features/notifications/toastTypes";
import { auth } from "../../../lib/firebase";
import { db } from "../../../lib/firestore";
import styles from "./ManagerLayout.module.css";

export type ManagerOutletContext = {
  onProfileChange: (profile: ManagerIdentity) => void;
  showToast: ShowToast;
};

function greetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

function initialsForName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TM";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function ManagerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const managerEmail = auth?.currentUser?.email ?? "Manager";
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => window.localStorage.getItem("timgas-manager-sidebar") === "collapsed",
  );
  const [desktopSidebar, setDesktopSidebar] = useState(
    () => window.matchMedia("(min-width: 64rem)").matches,
  );
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [dashboardSection, setDashboardSection] = useState(
    () => location.hash.slice(1) || "overview",
  );
  const [managerIdentity, setManagerIdentity] = useState<ManagerIdentity>({
    fullName: auth?.currentUser?.displayName ?? managerEmail.split("@")[0],
    position: "Administrator",
    avatarUrl: auth?.currentUser?.photoURL ?? "",
  });
  const [toast, setToast] = useState<{
    id: number;
    message: string;
    tone: ToastTone;
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(
    null,
  );
  const handleProfileChange = useCallback(
    (profile: ManagerIdentity) => setManagerIdentity(profile),
    [],
  );
  const showToast = useCallback<ShowToast>((message, tone = "success") => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), message, tone });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4_000);
  }, []);
  const activeSection =
    location.pathname === "/manager/profile"
      ? "profile"
      : location.pathname === "/manager/posts"
        ? "posts"
        : dashboardSection;
  const isSidebarCollapsed = desktopSidebar && collapsed;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 64rem)");
    const updateSidebarMode = () => setDesktopSidebar(media.matches);
    media.addEventListener("change", updateSidebarMode);
    return () => media.removeEventListener("change", updateSidebarMode);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(
      () => setCurrentHour(new Date().getHours()),
      60_000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    const user = auth?.currentUser;
    if (!db || !user) return;
    const firestore = db;
    let active = true;
    void getDoc(doc(firestore, "adminProfiles", user.uid))
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.data();
        setManagerIdentity({
          fullName:
            typeof data?.fullName === "string" && data.fullName.trim()
              ? data.fullName
              : (user.displayName ?? managerEmail.split("@")[0]),
          position:
            typeof data?.position === "string" && data.position.trim()
              ? data.position
              : "Administrator",
          avatarUrl:
            typeof data?.avatarUrl === "string"
              ? data.avatarUrl
              : (user.photoURL ?? ""),
        });
      })
      .catch((error) =>
        console.error("Unable to load the manager identity.", error),
      );
    return () => {
      active = false;
    };
  }, [managerEmail]);

  useEffect(() => {
    if (location.pathname !== "/manager/preview") return;
    const sectionIds = ["overview", "applications"];
    let frame = 0;
    const updateActiveSection = () => {
      const marker = Math.min(window.innerHeight * 0.28, 210);
      const sections = sectionIds
        .map((id) => ({ id, element: document.getElementById(id) }))
        .filter((section): section is { id: string; element: HTMLElement } =>
          Boolean(section.element),
        );
      const current = sections.reduce<(typeof sections)[number] | undefined>(
        (selected, section) =>
          section.element.getBoundingClientRect().top <= marker
            ? section
            : selected,
        sections[0],
      );
      setDashboardSection(current?.id ?? "overview");
    };
    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveSection);
    };
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [location.pathname]);

  const signOutManager = async () => {
    if (auth) await signOut(auth);
    navigate("/manager-login", { replace: true });
  };

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(
        "timgas-manager-sidebar",
        next ? "collapsed" : "expanded",
      );
      return next;
    });
  };

  const navigation = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      to: "/manager/preview",
    },
    {
      id: "applications",
      label: "Applications",
      icon: FileText,
      to: "/manager/preview#applications",
    },
    {
      id: "posts",
      label: "Public posts",
      icon: Megaphone,
      to: "/manager/posts",
    },
    {
      id: "profile",
      label: "Profile",
      icon: UserRound,
      to: "/manager/profile",
    },
  ];

  return (
    <div
      className={`${styles.shell} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}
    >
      <div className={styles.toastRegion} aria-live="polite" aria-atomic="true">
        {toast && (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[`toast${toast.tone[0].toUpperCase()}${toast.tone.slice(1)}`]}`}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            {toast.tone === "success" ? (
              <CircleCheck aria-hidden="true" />
            ) : toast.tone === "warning" ? (
              <TriangleAlert aria-hidden="true" />
            ) : (
              <CircleX aria-hidden="true" />
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.sidebarHead}>
          <BrandMark inverse compact iconOnly={isSidebarCollapsed} />
          <button
            className={styles.mobileClose}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
          <button
            className={styles.collapseButton}
            type="button"
            onClick={toggleSidebar}
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </button>
        </div>
        <nav aria-label="Manager navigation">
          {navigation.map(({ id, label, icon: Icon, to }) => (
            <Link
              key={id}
              className={activeSection === id ? styles.active : undefined}
              to={to}
              aria-current={activeSection === id ? "page" : undefined}
              aria-label={isSidebarCollapsed ? label : undefined}
              title={isSidebarCollapsed ? label : undefined}
              onClick={() => {
                if (id !== "profile") setDashboardSection(id);
                setOpen(false);
              }}
            >
              <Icon />
              <span className={styles.sidebarLabel}>{label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFoot}>
          <Link
            to="/"
            aria-label={isSidebarCollapsed ? "View public website" : undefined}
            title={isSidebarCollapsed ? "View public website" : undefined}
          >
            <Home />
            <span className={styles.sidebarLabel}>View public website</span>
          </Link>
          <button
            type="button"
            onClick={signOutManager}
            aria-label={isSidebarCollapsed ? "Sign out" : undefined}
            title={isSidebarCollapsed ? "Sign out" : undefined}
          >
            <LogOut />
            <span className={styles.sidebarLabel}>Sign out</span>
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.mobileMenu}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <div className={styles.profile}>
            <span>
              {managerIdentity.avatarUrl ? (
                <img src={managerIdentity.avatarUrl} alt="" />
              ) : (
                initialsForName(managerIdentity.fullName)
              )}
            </span>
            <div>
              <small className={styles.greeting}>
                {greetingForHour(currentHour)}
              </small>
              <strong>{managerIdentity.fullName}</strong>
              <small>{managerIdentity.position}</small>
            </div>
          </div>
        </header>
        <Outlet
          context={
            {
              onProfileChange: handleProfileChange,
              showToast,
            } satisfies ManagerOutletContext
          }
        />
      </main>
    </div>
  );
}
