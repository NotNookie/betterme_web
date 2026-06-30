import { ProductCard } from "./ProductCard.jsx";
import { SectionHeading } from "./SectionHeading.jsx";

export function ProductGrid({ products }) {
  return (
    <section className="section products-section" id="products">
      <div className="container">
        <SectionHeading
          eyebrow="Digital shop"
          title="Digital products ready for checkout"
          text="Choose a product, complete payment securely through PayMongo, and open the file from the success page."
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
