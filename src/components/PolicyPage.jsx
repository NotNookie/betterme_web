import { brand } from "../data/brand.js";
import { Footer } from "./Footer.jsx";
import { Header } from "./Header.jsx";

const policies = {
  "/policies/refund": {
    eyebrow: "Policy",
    title: "Refund Policy",
    sections: [
      {
        heading: "All sales are final",
        body: "Better Me Digitals sells digital products. Because downloads are delivered immediately after payment confirmation, all sales are generally final.",
      },
      {
        heading: "Technical issues",
        body: "If you experience a technical problem — such as a download link that does not work or a file that cannot be opened — contact us within 7 days of purchase. We will re-deliver your product or issue a refund at our discretion.",
      },
      {
        heading: "Master Resell Rights products",
        body: "Products sold with Master Resell Rights (MRR) include those rights as described in the product listing. These sales are also final.",
      },
      {
        heading: "No refunds for change of mind",
        body: "Refunds are not issued for accidental purchases or change of mind after payment is confirmed and the download is available.",
      },
      {
        heading: "How to request help",
        body: null,
        contact: true,
      },
    ],
  },
  "/policies/terms": {
    eyebrow: "Policy",
    title: "Terms of Service",
    sections: [
      {
        heading: "Agreement",
        body: "By completing a purchase from Better Me Digitals, you agree to these terms.",
      },
      {
        heading: "Digital products",
        body: "All products sold are digital files. No physical items are shipped. Downloads are delivered through a secure link on your order page immediately after payment.",
      },
      {
        heading: "Personal use license",
        body: "Products are licensed for personal use only. You may not resell, redistribute, or share the files with others unless the product listing explicitly states that Master Resell Rights (MRR) are included.",
      },
      {
        heading: "Payment",
        body: "Payment is processed by PayMongo. Their terms of service govern your transaction. Better Me Digitals does not store your card or payment details.",
      },
      {
        heading: "Order access",
        body: "Your download link is accessible from the browser used at checkout. Better Me Digitals is not responsible for access lost due to clearing browser data, switching devices, or using a different browser. If you lose access, use the order lookup page or contact us.",
      },
      {
        heading: "Availability",
        body: "We reserve the right to update or discontinue products without notice. Purchased downloads remain accessible for a reasonable period after purchase.",
      },
      {
        heading: "Contact",
        body: null,
        contact: true,
      },
    ],
  },
  "/policies/privacy": {
    eyebrow: "Policy",
    title: "Privacy Policy",
    sections: [
      {
        heading: "What we collect",
        body: "When you make a purchase, we store your order reference number and the product you bought. We do not collect your name, email address, or phone number during checkout.",
      },
      {
        heading: "Payment data",
        body: "Payment information — including card details and GCash numbers — is handled entirely by PayMongo. We do not receive or store any payment credentials.",
      },
      {
        heading: "How we use your data",
        body: "We use your order data solely to process and deliver your purchase and to resolve any support requests you raise.",
      },
      {
        heading: "We do not sell your data",
        body: "We do not sell, rent, or share your information with third parties.",
      },
      {
        heading: "Cookies and tracking",
        body: "This website uses no advertising trackers or analytics cookies.",
      },
      {
        heading: "Data deletion",
        body: "You may request deletion of your order data by contacting us. Include your order reference number.",
      },
      {
        heading: "Contact",
        body: null,
        contact: true,
      },
    ],
  },
};

function ContactLine() {
  return (
    <p>
      Email us at{" "}
      <a href={`mailto:${brand.email}`} className="policy-link">
        {brand.email}
      </a>{" "}
      and include your order reference number.
    </p>
  );
}

export function PolicyPage() {
  const policy = policies[window.location.pathname];

  if (!policy) {
    return (
      <>
        <Header />
        <main>
          <section className="section policy-section">
            <div className="container policy-content">
              <p className="eyebrow">Policy</p>
              <h1>Page not found.</h1>
              <p><a href="/" className="policy-link">Return home</a></p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <section className="section policy-section">
          <div className="container policy-content">
            <p className="eyebrow">{policy.eyebrow}</p>
            <h1>{policy.title}</h1>
            {policy.sections.map((section) => (
              <div key={section.heading} className="policy-section-block">
                <h2>{section.heading}</h2>
                {section.contact ? <ContactLine /> : <p>{section.body}</p>}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
