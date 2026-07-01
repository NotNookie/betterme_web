import { checkRateLimit, hashAccessToken, sendJson, supabaseRequest } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (!checkRateLimit(`order:${ip}`, 30, 60_000)) {
    sendJson(res, 429, { error: "Too many requests. Please try again later." });
    return;
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const reference = url.searchParams.get("reference");
    const accessToken = req.headers["x-checkout-access-token"];

    if (!reference) {
      sendJson(res, 400, { error: "Missing order reference." });
      return;
    }

    const orders = await supabaseRequest(
      `orders?reference_number=eq.${encodeURIComponent(reference)}&select=reference_number,product_title,status,download_url,access_token_hash`
    );
    const order = orders?.[0];

    if (!order) {
      sendJson(res, 404, { error: "Order not found." });
      return;
    }

    const canShowDownload =
      order.status === "paid" &&
      order.access_token_hash &&
      hashAccessToken(accessToken) === order.access_token_hash;

    sendJson(res, 200, {
      referenceNumber: order.reference_number,
      productTitle: order.product_title,
      status: order.status,
      downloadUrl: canShowDownload ? order.download_url : null,
      needsOriginalBrowser: order.status === "paid" && !canShowDownload,
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Order lookup failed." });
  }
}
