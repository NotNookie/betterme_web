import { useState } from "react";
import { brand } from "../data/brand.js";
import { Footer } from "./Footer.jsx";
import { Header } from "./Header.jsx";

export function OrderLookup() {
  const params = new URLSearchParams(window.location.search);
  const [reference, setReference] = useState(params.get("reference") || "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLookup(event) {
    event.preventDefault();
    const trimmed = reference.trim();

    if (!trimmed) {
      setError("Please enter your order reference number.");
      return;
    }

    setError("");
    setOrder(null);
    setIsLoading(true);

    try {
      // No access token — intentionally. This page shows status only, not the download link.
      const response = await fetch(`/api/order?reference=${encodeURIComponent(trimmed)}`);
      const json = await response.json();

      if (response.status === 404) {
        setError("No order found with that reference number. Check the number and try again.");
        return;
      }

      if (!response.ok) {
        setError(json.error || "Order could not be loaded.");
        return;
      }

      setOrder(json);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        <section className="section checkout-status-section">
          <div className="container checkout-status">
            <p className="eyebrow">Order lookup</p>
            <h1>Find your order.</h1>
            <p className="lookup-intro">
              Enter the reference number shown on your checkout success page or your PayMongo receipt.
            </p>

            <form className="lookup-form" onSubmit={handleLookup}>
              <label className="lookup-label" htmlFor="lookup-ref">
                Order reference number
              </label>
              <div className="lookup-row">
                <input
                  id="lookup-ref"
                  type="text"
                  className="lookup-input"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="BMD-..."
                  autoComplete="off"
                  spellCheck={false}
                />
                <button className="button button-primary" type="submit" disabled={isLoading}>
                  <span>{isLoading ? "Looking up..." : "Look up"}</span>
                  <span className="button-arrow" aria-hidden="true">-&gt;</span>
                </button>
              </div>
            </form>

            {error ? <p className="checkout-error">{error}</p> : null}

            {order ? (
              <div className="lookup-result">
                <div className="lookup-result-row">
                  <span>Product</span>
                  <strong>{order.productTitle}</strong>
                </div>
                <div className="lookup-result-row">
                  <span>Reference</span>
                  <strong>{order.referenceNumber}</strong>
                </div>
                <div className="lookup-result-row">
                  <span>Status</span>
                  <strong className={order.status === "paid" ? "lookup-status-paid" : ""}>
                    {order.status === "paid" ? "Paid" : "Pending"}
                  </strong>
                </div>

                {order.status === "paid" ? (
                  <div className="lookup-recovery">
                    <p>
                      <strong>Your payment was received.</strong> To access your download, open the
                      order success page from the same browser you used at checkout:
                    </p>
                    <a
                      className="button button-primary"
                      href={`/checkout/success?reference=${encodeURIComponent(order.referenceNumber)}`}
                    >
                      <span>Open order page</span>
                      <span className="button-arrow" aria-hidden="true">-&gt;</span>
                    </a>
                    <p className="lookup-contact">
                      If you can no longer access that browser, contact us and include your
                      reference number — we will send you the download manually.
                    </p>
                    <p className="lookup-contact">
                      Email:{" "}
                      <a href={`mailto:${brand.email}`} className="lookup-email">
                        {brand.email}
                      </a>
                    </p>
                  </div>
                ) : (
                  <p className="lookup-pending-note">
                    Payment has not been confirmed yet. If you already paid, wait a few minutes and
                    try again. If the issue persists, contact us at{" "}
                    <a href={`mailto:${brand.email}`} className="lookup-email">
                      {brand.email}
                    </a>
                    .
                  </p>
                )}
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
