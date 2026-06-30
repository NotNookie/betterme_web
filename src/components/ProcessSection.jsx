import { SectionHeading } from "./SectionHeading.jsx";

const steps = [
  {
    number: "01",
    title: "Choose a product",
    text: "Pick the printable or Canva template that fits the moment.",
  },
  {
    number: "02",
    title: "Checkout securely",
    text: "PayMongo hosts the secure payment step, so buyers do not need a custom account here.",
  },
  {
    number: "03",
    title: "Open the digital file",
    text: "After payment, the success page shows the download button in the same browser.",
  },
];

export function ProcessSection() {
  return (
    <section className="section process-section" id="how-it-works">
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="A simple digital buying flow"
          text="The website opens PayMongo checkout and releases the digital product after payment."
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
