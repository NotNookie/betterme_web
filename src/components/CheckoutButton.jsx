import { useState } from "react";

function getProductId(product) {
  return product.url.split("/").filter(Boolean).pop();
}

export function CheckoutButton({ product }) {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: getProductId(product),
          email,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Checkout could not be started.");
      }

      window.location.href = json.checkoutUrl;
    } catch (checkoutError) {
      setError(checkoutError.message);
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <button className="button button-primary product-button" type="button" onClick={() => setIsOpen(true)}>
        <span>Buy now</span>
        <span className="button-arrow" aria-hidden="true">
          -&gt;
        </span>
      </button>
    );
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <label htmlFor={`email-${getProductId(product)}`}>Delivery email</label>
      <input
        id={`email-${getProductId(product)}`}
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
      />
      {error ? <p className="checkout-error">{error}</p> : null}
      <div className="checkout-actions">
        <button className="button button-primary" type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? "Opening checkout..." : "Continue to payment"}</span>
          <span className="button-arrow" aria-hidden="true">
            -&gt;
          </span>
        </button>
        <button className="checkout-cancel" type="button" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
