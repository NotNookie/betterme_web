import { brand } from "../data/brand.js";
import { ButtonLink } from "./ButtonLink.jsx";
import { SectionHeading } from "./SectionHeading.jsx";

const contacts = [
  {
    label: "Instagram",
    value: "@better.me_digitals",
    href: brand.instagramUrl,
  },
  {
    label: "Facebook",
    value: "Better Me Digitals",
    href: brand.facebookUrl,
  },
  {
    label: "Phone",
    value: brand.phone,
    href: `tel:${brand.phone.replaceAll(" ", "")}`,
  },
  {
    label: "Email",
    value: brand.email,
    href: `mailto:${brand.email}`,
  },
];

export function ContactSection() {
  return (
    <section className="section contact-section" id="contact">
      <div className="container contact-grid">
        <SectionHeading
          eyebrow="Contact"
          title="Questions before buying?"
          text="Message Better Me Digitals for product details, bundle requests, or help opening a Canva template link."
        />

        <div className="contact-card">
          {contacts.map((item) => (
            <a
              className="contact-row"
              href={item.href}
              key={item.label}
              rel={item.href.startsWith("http") ? "noreferrer" : undefined}
              target={item.href.startsWith("http") ? "_blank" : undefined}
            >
              <span className="contact-label">{item.label}</span>
              <span className="contact-value">{item.value}</span>
            </a>
          ))}

          <ButtonLink href={brand.shopUrl} variant="primary" className="contact-button">
            Shop on Raket
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
