import { LogoMark } from "./LogoMark.jsx";

export function HeroArtwork() {
  return (
    <div className="hero-art" aria-label="Better Me Digitals visual preview">
      <div className="art-panel art-panel-left">
        <LogoMark large />
        <div className="line-art" aria-hidden="true">
          <span className="line-head" />
          <span className="line-body" />
          <span className="line-heart" />
        </div>
      </div>

      <div className="art-panel art-panel-right">
        <p>Avail now</p>
        <div className="product-stack" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <ul>
          <li>Coloring books</li>
          <li>Canva links</li>
          <li>Printable sheets</li>
        </ul>
      </div>
    </div>
  );
}
