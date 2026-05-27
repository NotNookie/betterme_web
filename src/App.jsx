import { Analytics } from "@vercel/analytics/react";
import { ContactSection } from "./components/ContactSection.jsx";
import { FaqSection } from "./components/FaqSection.jsx";
import { Footer } from "./components/Footer.jsx";
import { Header } from "./components/Header.jsx";
import { Hero } from "./components/Hero.jsx";
import { ProductGrid } from "./components/ProductGrid.jsx";
import { ProcessSection } from "./components/ProcessSection.jsx";
import { ShopBanner } from "./components/ShopBanner.jsx";
import { products } from "./data/products.js";

export default function App() {
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
