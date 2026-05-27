import { brand } from "../data/brand.js";
import { ButtonLink } from "./ButtonLink.jsx";

export function ShopBanner() {
  return (
    <section className="shop-banner">
      <div className="container shop-banner-inner">
        <div>
          <p className="eyebrow">Available now</p>
          <h2>Visit the Better Me Digitals shop.</h2>
        </div>
        <ButtonLink href={brand.shopUrl} variant="light">
          Open Raket shop
        </ButtonLink>
      </div>
    </section>
  );
}
