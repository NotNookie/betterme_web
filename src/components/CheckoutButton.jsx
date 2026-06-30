import { useState } from "react";

function getProductId(product) {
  return product.url.split("/").filter(Boolean).pop();
}

function createAccessToken() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function CheckoutButton({ product }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setError("");
    setIsSubmitting(true);

    try {
      const accessToken = createAccessToken();
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: getProductId(product),
          accessToken,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Checkout could not be started.");
      }

      window.sessionStorage.setItem(`checkout-access:${json.referenceNumber}`, accessToken);
      window.location.href = json.checkoutUrl;
    } catch (checkoutError) {
      setError(checkoutError.message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="checkout-form">
      <button className="button button-primary product-button" type="button" onClick={handleCheckout} disabled={isSubmitting}>
        <span>{isSubmitting ? "Opening checkout..." : "Buy now"}</span>
        <span className="button-arrow" aria-hidden="true">
          -&gt;
        </span>
      </button>
      {error ? <p className="checkout-error">{error}</p> : null}
    </div>
  );
}
