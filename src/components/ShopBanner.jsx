import { ButtonLink } from "./ButtonLink.jsx";

export function ShopBanner() {
  return (
    <section className="shop-banner">
      <div className="container shop-banner-inner">
        <div>
          <p className="eyebrow">Available now</p>
          <h2>Choose a Better Me Digitals product.</h2>
        </div>
        <ButtonLink href="#products" variant="light">
          Browse products
        </ButtonLink>
      </div>
    </section>
  );
}
