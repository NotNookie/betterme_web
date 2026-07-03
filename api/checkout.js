import {
  checkRateLimit,
  createReferenceNumber,
  findProduct,
  getPaymentMethodTypes,
  getProductAmount,
  getProductId,
  getSiteUrl,
  hashAccessToken,
  readJson,
  sendJson,
  supabaseRequest,
} from "./_utils.js";

async function deleteOrder(referenceNumber) {
  await supabaseRequest(
    `orders?reference_number=eq.${encodeURIComponent(referenceNumber)}`,
    { method: "DELETE", headers: { Prefer: "return=minimal" } }
  ).catch(() => {});
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (!checkRateLimit(`checkout:${ip}`, 10, 60_000)) {
    sendJson(res, 429, { error: "Too many requests. Please try again later." });
    return;
  }

  try {
    const { productId, accessToken } = await readJson(req);
    const product = findProduct(productId);

    if (!product) {
      sendJson(res, 404, { error: "Product not found." });
      return;
    }

    if (!accessToken || typeof accessToken !== "string" || accessToken.length < 32) {
      sendJson(res, 400, { error: "Invalid access token." });
      return;
    }

    if (!process.env.PAYMONGO_SECRET_KEY) {
      sendJson(res, 500, { error: "PayMongo secret key is not configured." });
      return;
    }

    const referenceNumber = createReferenceNumber();
    const amount = getProductAmount(product);
    const siteUrl = getSiteUrl(req);
    const accessTokenHash = hashAccessToken(accessToken);

    await supabaseRequest("orders", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        reference_number: referenceNumber,
        product_id: getProductId(product),
        product_title: product.title,
        amount,
        currency: "PHP",
        status: "pending",
        access_token_hash: accessTokenHash,
      }),
    });

    let paymongoResponse;
    let paymongoJson;

    try {
      paymongoResponse = await fetch("https://api.paymongo.com/v2/checkout_sessions", {
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

      paymongoJson = await paymongoResponse.json();
    } catch (paymongoError) {
      // PayMongo call failed — remove the orphaned pending order.
      await deleteOrder(referenceNumber);
      throw paymongoError;
    }

    if (!paymongoResponse.ok) {
      await deleteOrder(referenceNumber);
      sendJson(res, paymongoResponse.status, {
        error: paymongoJson?.errors?.[0]?.detail || "PayMongo checkout could not be created.",
      });
      return;
    }

    const checkoutUrl = paymongoJson.data?.attributes?.checkout_url;
    const checkoutSessionId = paymongoJson.data?.id;

    if (!checkoutUrl || !checkoutSessionId) {
      await deleteOrder(referenceNumber);
      sendJson(res, 500, { error: "PayMongo did not return a valid checkout session." });
      return;
    }

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
