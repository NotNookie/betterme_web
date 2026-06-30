import { Analytics } from "@vercel/analytics/react";
import { products } from "../data/products.js";
import { ButtonLink } from "./ButtonLink.jsx";
import { CheckoutButton } from "./CheckoutButton.jsx";
import { Footer } from "./Footer.jsx";
import { Header } from "./Header.jsx";

function getProductId(product) {
  return product.url.split("/").filter(Boolean).pop();
}

function getProductFromPath(pathname) {
  const productId = decodeURIComponent(pathname.replace(/^\/products\//, "").replace(/\/$/, ""));
  return products.find((product) => getProductId(product) === productId);
}

export function ProductDetail() {
  const product = getProductFromPath(window.location.pathname);

  return (
    <>
      <Header />
      <main>
        <section className="section product-detail-section">
          <div className="container">
            {product ? (
              <div className="product-detail">
                <div className="product-detail-image">
                  <img src={product.image} alt={`${product.title} product preview`} />
                </div>

                <div className="product-detail-content">
                  <ButtonLink href="/#products" variant="text" className="product-detail-back">
                    Back to products
                  </ButtonLink>
                  <p className="product-eyebrow">{product.category}</p>
                  <h1>{product.title}</h1>
                  <p className="product-detail-price">{product.price}</p>
                  <p className="product-detail-description">{product.description}</p>

                  <div className="product-detail-checkout">
                    <CheckoutButton product={product} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="product-detail-empty">
                <p className="eyebrow">Product</p>
                <h1>Product not found.</h1>
                <p>This product may no longer be available in the Better Me Digitals shop.</p>
                <ButtonLink href="/#products">Browse products</ButtonLink>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
