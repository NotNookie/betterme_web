import { SectionHeading } from "./SectionHeading.jsx";

const steps = [
  {
    number: "01",
    title: "Choose a product",
    text: "Browse the Raket shop and pick the printable or Canva template that fits the moment.",
  },
  {
    number: "02",
    title: "Checkout securely",
    text: "Raket handles the storefront and purchase flow so buyers do not need a custom account here.",
  },
  {
    number: "03",
    title: "Open the digital file",
    text: "Customers follow the product instructions to download, print, or open the Canva template.",
  },
];

export function ProcessSection() {
  return (
    <section className="section process-section" id="how-it-works">
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="A simple digital buying flow"
          text="The website introduces the brand, then sends customers to the existing Raket checkout for payment and delivery."
        />

        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
