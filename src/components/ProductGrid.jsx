import { ProductCard } from "./ProductCard.jsx";
import { SectionHeading } from "./SectionHeading.jsx";

export function ProductGrid({ products }) {
  return (
    <section className="section products-section" id="products">
      <div className="container">
        <SectionHeading
          eyebrow="Digital shop"
          title="Real products from the Raket shop"
          text="Each product card links directly to the matching Better Me Digitals product page on Raket for checkout and delivery."
        />

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard product={product} key={product.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
