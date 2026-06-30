import { useEffect, useState } from "react";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";

export function CheckoutSuccess() {
  const params = new URLSearchParams(window.location.search);
  const reference = params.get("reference");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setError("Missing order reference.");
      return;
    }

    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    let isMounted = true;
    let attempts = 0;

    async function loadOrder() {
      attempts += 1;

      try {
        const accessToken = window.sessionStorage.getItem(`checkout-access:${reference}`) || "";
        const response = await fetch(`/api/order?reference=${encodeURIComponent(reference)}`, {
          headers: { "X-Checkout-Access-Token": accessToken },
        });
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Order could not be loaded.");
        }

        if (!isMounted) {
          return;
        }

        setOrder(json);

        if (json.status !== "paid" && attempts < 8) {
          window.setTimeout(loadOrder, 2500);
        }
      } catch (orderError) {
        if (isMounted) {
          setError(orderError.message);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [reference]);

  return (
    <>
      <Header />
      <main>
        <section className="section checkout-status-section">
          <div className="container checkout-status">
            <p className="eyebrow">Checkout</p>
            <h1>Thank you for your order.</h1>
            {error ? <p className="checkout-error">{error}</p> : null}
            {!error && !order ? <p>Checking payment status...</p> : null}
            {order ? (
              <>
                <p>
                  Order <strong>{order.referenceNumber}</strong> for <strong>{order.productTitle}</strong> is{" "}
                  <strong>{order.status}</strong>.
                </p>
                {order.downloadUrl ? (
                  <a className="button button-primary" href={order.downloadUrl} target="_blank" rel="noreferrer">
                    <span>Click to download / view</span>
                    <span className="button-arrow" aria-hidden="true">
                      -&gt;
                    </span>
                  </a>
                ) : (
                  <p>
                    {order.needsOriginalBrowser
                      ? "For security, open this order from the browser used at checkout to view the download."
                      : "Your download link will appear here after PayMongo confirms payment."}
                  </p>
                )}
              </>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
