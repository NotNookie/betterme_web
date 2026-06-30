import { CheckoutButton } from "./CheckoutButton.jsx";

function getProductId(product) {
  return product.url.split("/").filter(Boolean).pop();
}

export function ProductCard({ product }) {
  const productHref = `/products/${getProductId(product)}`;
  const saveProductGridPosition = () => {
    window.sessionStorage.setItem("products-scroll-y", String(window.scrollY));
  };

  return (
    <article className="product-card">
      <a
        className="product-image-wrap"
        href={productHref}
        aria-label={`View ${product.title}`}
        onClick={saveProductGridPosition}
      >
        <img src={product.image} alt={`${product.title} product preview`} loading="lazy" />
      </a>

      <div className="product-meta">
        <p className="product-eyebrow">{product.category}</p>
        <p className="product-price">{product.price}</p>
      </div>
      <h3>
        <a href={productHref} onClick={saveProductGridPosition}>
          {product.title}
        </a>
      </h3>
      <p>{product.description}</p>
      <CheckoutButton product={product} />
    </article>
  );
}
