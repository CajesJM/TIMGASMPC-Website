import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop';
import { PublicLayout } from './layouts/PublicLayout/PublicLayout';
import { HomePage } from './pages/HomePage/HomePage';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';

const LoginPage = lazy(() =>
  import('./pages/LoginPage/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('./pages/admin/DashboardPage').then((module) => ({ default: module.DashboardPage })),
);
const ProtectedManagerRoute = lazy(() =>
  import('./components/ProtectedManagerRoute/ProtectedManagerRoute').then((module) => ({
    default: module.ProtectedManagerRoute,
  })),
);

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<main aria-live="polite"><p className="srOnly">Loading…</p></main>}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<Navigate to="/#about" replace />} />
          <Route path="membership" element={<Navigate to="/#membership" replace />} />
          <Route path="services" element={<Navigate to="/#services" replace />} />
          <Route path="news" element={<Navigate to="/#news" replace />} />
          <Route path="contact" element={<Navigate to="/#contact" replace />} />
          <Route path="faq" element={<Navigate to="/#membership" replace />} />
          <Route path="apply" element={<Navigate to="/#application" replace />} />
        </Route>
        <Route path="manager-login" element={<LoginPage />} />
        <Route
          path="manager/preview"
          element={
            <ProtectedManagerRoute>
              <DashboardPage />
            </ProtectedManagerRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </>
  );
}
