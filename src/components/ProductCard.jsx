import { ButtonLink } from "./ButtonLink.jsx";

export function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={`${product.title} product preview`} loading="lazy" />
      </div>

      <div className="product-meta">
        <p className="product-eyebrow">{product.category}</p>
        <p className="product-price">{product.price}</p>
      </div>
      <h3>{product.title}</h3>
      <p>{product.description}</p>
      <ButtonLink href={product.url} variant="primary" className="product-button">
        Buy on Raket
      </ButtonLink>
    </article>
  );
}
