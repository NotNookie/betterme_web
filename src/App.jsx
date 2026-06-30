import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { ContactSection } from "./components/ContactSection.jsx";
import { FaqSection } from "./components/FaqSection.jsx";
import { Footer } from "./components/Footer.jsx";
import { Header } from "./components/Header.jsx";
import { Hero } from "./components/Hero.jsx";
import { CheckoutSuccess } from "./components/CheckoutSuccess.jsx";
import { ProductDetail } from "./components/ProductDetail.jsx";
import { ProductGrid } from "./components/ProductGrid.jsx";
import { ProcessSection } from "./components/ProcessSection.jsx";
import { ShopBanner } from "./components/ShopBanner.jsx";
import { products } from "./data/products.js";

export default function App() {
  useEffect(() => {
    const savedScrollY = window.sessionStorage.getItem("products-scroll-y");
    const shouldRestoreProducts = new URLSearchParams(window.location.search).get("restore") === "products";

    if (!savedScrollY || !shouldRestoreProducts || window.location.pathname !== "/") {
      return;
    }

    window.sessionStorage.removeItem("products-scroll-y");
    window.history.replaceState(null, "", "/");
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: Number(savedScrollY), behavior: "auto" });
    });
  }, []);

  if (window.location.pathname === "/checkout/success") {
    return <CheckoutSuccess />;
  }

  if (window.location.pathname.startsWith("/products/")) {
    return <ProductDetail />;
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductGrid products={products} />
        <ProcessSection />
        <ShopBanner />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
