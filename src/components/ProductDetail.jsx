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

function getProductHighlights(product) {
  const category = product.category.toLowerCase();

  if (category.includes("kids") || category.includes("coloring")) {
    return ["Printable activity pages", "Designed for playful learning", "Ready after payment"];
  }

  if (category.includes("canva") || category.includes("business") || category.includes("planner")) {
    return ["Editable Canva access", "Digital template format", "Ready after payment"];
  }

  return ["Digital product access", "No shipping needed", "Ready after payment"];
}

export function ProductDetail() {
  const product = getProductFromPath(window.location.pathname);
  const highlights = product ? getProductHighlights(product) : [];

  return (
    <>
      <Header />
      <main>
        <section className="section product-detail-section">
          <div className="container">
            {product ? (
              <div className="product-detail">
                <div className="product-detail-media">
                  <div className="product-detail-image">
                    <img src={product.image} alt={`${product.title} product preview`} />
                  </div>
                  <div className="product-detail-note">
                    <span>Digital file</span>
                    <span>No physical shipping</span>
                  </div>
                </div>

                <div className="product-detail-content">
                  <ButtonLink href="/#products" variant="text" className="product-detail-back">
                    Back to products
                  </ButtonLink>
                  <div>
                    <p className="product-eyebrow">{product.category}</p>
                    <h1>{product.title}</h1>
                  </div>
                  <p className="product-detail-description">{product.description}</p>

                  <div className="product-detail-highlights" aria-label="Product highlights">
                    {highlights.map((highlight) => (
                      <span key={highlight}>{highlight}</span>
                    ))}
                  </div>

                  <div className="product-detail-purchase">
                    <div className="product-detail-purchase-top">
                      <div>
                        <span>Price</span>
                        <p>{product.price}</p>
                      </div>
                      <strong>PayMongo checkout</strong>
                    </div>
                    <CheckoutButton product={product} />
                    <p className="product-detail-delivery">
                      After payment, the download button appears on your order page in this browser.
                    </p>
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
