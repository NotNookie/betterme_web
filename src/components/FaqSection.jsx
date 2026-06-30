import { SectionHeading } from "./SectionHeading.jsx";

const faqs = [
  {
    question: "How do customers receive their order?",
    answer:
      "After PayMongo confirms payment, the download button appears on the success page in the same browser.",
  },
  {
    question: "Do Canva products need an account?",
    answer:
      "Editable Canva links work best with a free or paid Canva account, depending on the template content used.",
  },
  {
    question: "Are these physical items?",
    answer:
      "No. Better Me Digitals sells digital products such as printable files and editable Canva template links.",
  },
];

export function FaqSection() {
  return (
    <section className="section faq-section" id="faq">
      <div className="container">
        <SectionHeading
          eyebrow="Details"
          title="Clear before checkout"
          text="Digital products are meant to be easy to buy, receive, and use without waiting for shipping."
        />

        <div className="faq-list">
          {faqs.map((item) => (
            <article className="faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
