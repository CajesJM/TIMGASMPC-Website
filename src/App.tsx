import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop/ScrollToTop";
import { PublicLayout } from "./layouts/PublicLayout/PublicLayout";
import { HomePage } from "./pages/HomePage/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage/NotFoundPage";

const LoginPage = lazy(() =>
  import("./pages/LoginPage/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./pages/admin/DashboardPage/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const ManagerProfilePage = lazy(() =>
  import("./pages/admin/ManagerProfilePage/ManagerProfilePage").then(
    (module) => ({ default: module.ManagerProfilePage }),
  ),
);
const ManagerPostsPage = lazy(() =>
  import("./pages/admin/ManagerPostsPage/ManagerPostsPage").then((module) => ({
    default: module.ManagerPostsPage,
  })),
);
const ManagerApplicationsPage = lazy(() =>
  import("./pages/admin/ManagerApplicationsPage/ManagerApplicationsPage").then(
    (module) => ({ default: module.ManagerApplicationsPage }),
  ),
);
const ManagerLayout = lazy(() =>
  import("./layouts/admin/ManagerLayout/ManagerLayout").then((module) => ({
    default: module.ManagerLayout,
  })),
);
const ProtectedManagerRoute = lazy(() =>
  import("./components/admin/ProtectedManagerRoute/ProtectedManagerRoute").then(
    (module) => ({
      default: module.ProtectedManagerRoute,
    }),
  ),
);

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense
        fallback={
          <main aria-live="polite">
            <p className="srOnly">Loading…</p>
          </main>
        }
      >
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<Navigate to="/#about" replace />} />
            <Route
              path="membership"
              element={<Navigate to="/#membership" replace />}
            />
            <Route
              path="services"
              element={<Navigate to="/#contact" replace />}
            />
            <Route path="news" element={<Navigate to="/#news" replace />} />
            <Route
              path="contact"
              element={<Navigate to="/#contact" replace />}
            />
            <Route
              path="faq"
              element={<Navigate to="/#membership" replace />}
            />
            <Route
              path="apply"
              element={<Navigate to="/#application" replace />}
            />
          </Route>
          <Route path="manager-login" element={<LoginPage />} />
          <Route
            path="manager"
            element={
              <ProtectedManagerRoute>
                <ManagerLayout />
              </ProtectedManagerRoute>
            }
          >
            <Route index element={<Navigate to="preview" replace />} />
            <Route path="preview" element={<DashboardPage />} />
            <Route path="applications" element={<ManagerApplicationsPage />} />
            <Route path="posts" element={<ManagerPostsPage />} />
            <Route path="profile" element={<ManagerProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
