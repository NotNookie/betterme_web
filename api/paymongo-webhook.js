import crypto from "node:crypto";
import {
  getDeliveryLink,
  readRawBody,
  sendDeliveryEmail,
  sendJson,
  supabaseRequest,
} from "./_utils.js";

function getSignatureValue(header) {
  if (!header) {
    return null;
  }

  const v1 = String(header)
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.startsWith("v1="));

  return v1 ? v1.slice(3) : String(header).trim();
}

function verifySignature(rawBody, signatureHeader) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!secret) {
    return false;
  }

  const receivedSignature = getSignatureValue(signatureHeader);
  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  if (!receivedSignature) {
    return false;
  }

  const received = Buffer.from(receivedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const rawBody = await readRawBody(req);

  if (!verifySignature(rawBody, req.headers["paymongo-signature"])) {
    sendJson(res, 401, { error: "Invalid signature." });
    return;
  }

  try {
    const payload = JSON.parse(rawBody.toString("utf8"));
    const event = payload.data;
    const eventId = event?.id;

    if (event?.type !== "checkout_session.payment.paid") {
      sendJson(res, 200, { received: true });
      return;
    }

    if (eventId) {
      try {
        await supabaseRequest("webhook_events", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            event_id: eventId,
            event_type: event.type,
            payload,
          }),
        });
      } catch (error) {
        if (error.status === 409) {
          sendJson(res, 200, { received: true, duplicate: true });
          return;
        }

        throw error;
      }
    }

    const session = event.data;
    const referenceNumber = session?.attributes?.reference_number;

    if (!referenceNumber) {
      sendJson(res, 200, { received: true });
      return;
    }

    const orders = await supabaseRequest(
      `orders?reference_number=eq.${encodeURIComponent(referenceNumber)}&select=reference_number,product_id,product_title,customer_email,status`
    );
    const order = orders?.[0];

    if (!order || order.status === "paid") {
      sendJson(res, 200, { received: true });
      return;
    }

    const downloadUrl = getDeliveryLink(order.product_id);

    await supabaseRequest(`orders?reference_number=eq.${encodeURIComponent(referenceNumber)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        status: "paid",
        paid_at: new Date().toISOString(),
        download_url: downloadUrl,
        paymongo_payload: payload,
      }),
    });

    await sendDeliveryEmail({
      customerEmail: order.customer_email,
      productTitle: order.product_title,
      referenceNumber,
      downloadUrl,
    });

    sendJson(res, 200, { received: true });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Webhook failed." });
  }
}
