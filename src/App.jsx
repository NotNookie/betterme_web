import { useEffect } from "react";
import { ContactSection } from "./components/ContactSection.jsx";
import { FaqSection } from "./components/FaqSection.jsx";
import { Footer } from "./components/Footer.jsx";
import { Header } from "./components/Header.jsx";
import { Hero } from "./components/Hero.jsx";
import { CheckoutSuccess } from "./components/CheckoutSuccess.jsx";
import { OrderLookup } from "./components/OrderLookup.jsx";
import { PolicyPage } from "./components/PolicyPage.jsx";
import { ProductDetail } from "./components/ProductDetail.jsx";
import { ProductGrid } from "./components/ProductGrid.jsx";
import { ProcessSection } from "./components/ProcessSection.jsx";
import { ShopBanner } from "./components/ShopBanner.jsx";
import { products } from "./data/products.js";

const POLICY_PATHS = ["/policies/refund", "/policies/terms", "/policies/privacy"];

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

  const { pathname } = window.location;

  if (pathname === "/checkout/success") {
    return <CheckoutSuccess />;
  }

  if (pathname === "/order-lookup") {
    return <OrderLookup />;
  }

  if (POLICY_PATHS.includes(pathname)) {
    return <PolicyPage />;
  }

  if (pathname.startsWith("/products/")) {
    return <ProductDetail />;
  }

  if (pathname !== "/") {
    return (
      <>
        <Header />
        <main>
          <section className="section">
            <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
              <p className="eyebrow">404</p>
              <h1>Page not found</h1>
              <p style={{ marginTop: "1rem" }}>
                <a href="/" className="policy-link">Go back home</a>
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
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
    </>
  );
}
