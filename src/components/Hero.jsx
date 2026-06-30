import { ButtonLink } from "./ButtonLink.jsx";
import { HeroArtwork } from "./HeroArtwork.jsx";

export function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Your digital future awaits</p>
          <h1>Printable calm and Canva-ready creativity.</h1>
          <p className="hero-text">
            Better Me Digitals sells coloring books, editable Canva template
            links, and gentle printable resources for customers who want
            beautiful digital products without waiting for delivery.
          </p>

          <div className="hero-actions">
            <ButtonLink href="#products">See products</ButtonLink>
          </div>
        </div>

        <HeroArtwork />
      </div>
    </section>
  );
}
