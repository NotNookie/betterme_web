import { brand } from "../data/brand.js";
import { ButtonLink } from "./ButtonLink.jsx";
import { LogoMark } from "./LogoMark.jsx";

const navItems = [
  { label: "Products", href: "/#products" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
];

export function Header() {
  return (
    <header className="site-header" id="top">
      <nav className="container nav" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="Better Me Digitals home">
          <LogoMark />
          <span>{brand.name}</span>
        </a>

        <div className="nav-links">
          {navItems.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </div>

        <ButtonLink href="/#products" variant="compact">
          Shop
        </ButtonLink>
      </nav>
    </header>
  );
}
