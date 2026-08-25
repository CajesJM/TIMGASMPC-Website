import { Outlet } from "react-router-dom";
import { Footer } from "@/components/user/layout/Footer/Footer";
import { Header } from "@/components/user/layout/Header/Header";
export function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
