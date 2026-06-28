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
    </footer>
  );
}
