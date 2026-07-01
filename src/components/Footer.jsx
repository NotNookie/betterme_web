import { brand } from "../data/brand.js";
import { LogoMark } from "./LogoMark.jsx";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a className="brand footer-brand" href="/" aria-label="Better Me Digitals home">
          <LogoMark />
          <span>{brand.name}</span>
        </a>
        <p>Digital coloring books, Canva links, and printable calm for everyday creativity.</p>
      </div>
      <div className="container footer-links">
        <a href="/order-lookup">Look up an order</a>
        <a href="/policies/refund">Refund Policy</a>
        <a href="/policies/terms">Terms of Service</a>
        <a href="/policies/privacy">Privacy Policy</a>
      </div>
    </footer>
  );
}
