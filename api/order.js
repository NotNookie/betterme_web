import { sendJson, supabaseRequest } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const reference = url.searchParams.get("reference");

    if (!reference) {
      sendJson(res, 400, { error: "Missing order reference." });
      return;
    }

    const orders = await supabaseRequest(
      `orders?reference_number=eq.${encodeURIComponent(reference)}&select=reference_number,product_title,status,download_url`
    );
    const order = orders?.[0];

    if (!order) {
      sendJson(res, 404, { error: "Order not found." });
      return;
    }

    sendJson(res, 200, {
      referenceNumber: order.reference_number,
      productTitle: order.product_title,
      status: order.status,
      downloadUrl: order.status === "paid" ? order.download_url : null,
    });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Order lookup failed." });
  }
}
