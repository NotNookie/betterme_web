import {
  createReferenceNumber,
  findProduct,
  getPaymentMethodTypes,
  getProductAmount,
  getProductId,
  getSiteUrl,
  isValidEmail,
  readJson,
  sendJson,
  supabaseRequest,
} from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const { productId, email } = await readJson(req);
    const customerEmail = String(email || "").trim().toLowerCase();
    const product = findProduct(productId);

    if (!product) {
      sendJson(res, 404, { error: "Product not found." });
      return;
    }

    if (!isValidEmail(customerEmail)) {
      sendJson(res, 400, { error: "Enter a valid email address." });
      return;
    }

    if (!process.env.PAYMONGO_SECRET_KEY) {
      sendJson(res, 500, { error: "PayMongo secret key is not configured." });
      return;
    }

    const referenceNumber = createReferenceNumber();
    const amount = getProductAmount(product);
    const siteUrl = getSiteUrl(req);

    await supabaseRequest("orders", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        reference_number: referenceNumber,
        product_id: getProductId(product),
        product_title: product.title,
        customer_email: customerEmail,
        amount,
        currency: "PHP",
        status: "pending",
      }),
    });

    const paymongoResponse = await fetch("https://api.paymongo.com/v2/checkout_sessions", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString("base64")}`,
        "Content-Type": "application/json",
        "Idempotency-Key": referenceNumber,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: [
              {
                name: product.title,
                amount,
                currency: "PHP",
                quantity: 1,
              },
            ],
            payment_method_types: getPaymentMethodTypes(),
            success_url: `${siteUrl}/checkout/success?reference=${encodeURIComponent(referenceNumber)}`,
            cancel_url: `${siteUrl}/#products`,
            reference_number: referenceNumber,
            metadata: {
              reference_number: referenceNumber,
              product_id: getProductId(product),
            },
          },
        },
      }),
    });

    const paymongoJson = await paymongoResponse.json();

    if (!paymongoResponse.ok) {
      sendJson(res, paymongoResponse.status, {
        error: paymongoJson?.errors?.[0]?.detail || "PayMongo checkout could not be created.",
      });
      return;
    }

    const checkoutUrl = paymongoJson.data?.attributes?.checkout_url;
    const checkoutSessionId = paymongoJson.data?.id;

    await supabaseRequest(`orders?reference_number=eq.${encodeURIComponent(referenceNumber)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ paymongo_checkout_session_id: checkoutSessionId }),
    });

    sendJson(res, 200, { checkoutUrl, referenceNumber });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Checkout failed." });
  }
}
