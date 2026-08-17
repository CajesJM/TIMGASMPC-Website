import { Route, Routes } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop';
import { PublicLayout } from './layouts/PublicLayout/PublicLayout';
import { AboutPage } from './pages/AboutPage/AboutPage';
import { ApplicationPage } from './pages/ApplicationPage/ApplicationPage';
import { ContactPage } from './pages/ContactPage/ContactPage';
import { FaqPage } from './pages/FaqPage/FaqPage';
import { HomePage } from './pages/HomePage/HomePage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { MembershipPage } from './pages/MembershipPage/MembershipPage';
import { NewsPage } from './pages/NewsPage/NewsPage';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';
import { ServicesPage } from './pages/ServicesPage/ServicesPage';
import { DashboardPage } from './pages/admin/DashboardPage';

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="membership" element={<MembershipPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="apply" element={<ApplicationPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
        <Route path="manager-login" element={<LoginPage />} />
        <Route path="manager/preview" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
