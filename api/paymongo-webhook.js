import crypto from "node:crypto";
import {
  getDeliveryLink,
  readRawBody,
  sendDeliveryEmail,
  sendJson,
  supabaseRequest,
} from "./_utils.js";

function getSignatureParts(header) {
  if (!header) {
    return {};
  }

  return String(header)
    .split(",")
    .map((part) => part.trim())
    .reduce((parts, part) => {
      const [key, value] = part.split("=");
      if (key) {
        parts[key] = value || "";
      }
      return parts;
    }, {});
}

function verifySignature(rawBody, signatureHeader, livemode) {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!secret) {
    return false;
  }

  const signatureParts = getSignatureParts(signatureHeader);
  const timestamp = signatureParts.t;
  const receivedSignature = livemode ? signatureParts.li : signatureParts.te;

  if (!timestamp || !receivedSignature) {
    return false;
  }

  const timestampAgeMs = Math.abs(Date.now() - Number(timestamp) * 1000);
  if (!Number.isFinite(timestampAgeMs) || timestampAgeMs > 10 * 60 * 1000) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
  const received = Buffer.from(receivedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    const payload = JSON.parse(rawBody.toString("utf8"));
    const event = payload.data;
    const eventId = event?.id;
    const eventType = event?.attributes?.type;
    const livemode = Boolean(event?.attributes?.livemode);

    if (!verifySignature(rawBody, req.headers["paymongo-signature"], livemode)) {
      sendJson(res, 401, { error: "Invalid signature." });
      return;
    }

    if (eventType !== "checkout_session.payment.paid") {
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
            event_type: eventType,
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

    const session = event.attributes?.data;
    const sessionAttributes = session?.attributes || {};
    const payment = sessionAttributes.payments?.[0];
    const paymentAttributes = payment?.attributes || {};
    const referenceNumber =
      sessionAttributes.reference_number ||
      paymentAttributes.external_reference_number ||
      sessionAttributes.metadata?.reference_number ||
      paymentAttributes.metadata?.reference_number;

    if (!referenceNumber) {
      sendJson(res, 200, { received: true });
      return;
    }

    const orders = await supabaseRequest(
      `orders?reference_number=eq.${encodeURIComponent(referenceNumber)}&select=reference_number,product_id,product_title,customer_email,status,delivery_email_sent_at`
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

    if (!order.delivery_email_sent_at) {
      try {
        const emailResult = await sendDeliveryEmail({
          customerEmail: order.customer_email,
          productTitle: order.product_title,
          referenceNumber,
          downloadUrl,
        });

        if (emailResult.skipped) {
          await supabaseRequest(`orders?reference_number=eq.${encodeURIComponent(referenceNumber)}`, {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              delivery_email_error: emailResult.reason || "Delivery email skipped.",
            }),
          });
        } else {
          await supabaseRequest(`orders?reference_number=eq.${encodeURIComponent(referenceNumber)}`, {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              delivery_email_sent_at: new Date().toISOString(),
              delivery_email_provider_id: emailResult.id,
              delivery_email_error: null,
            }),
          });
        }
      } catch (error) {
        await supabaseRequest(`orders?reference_number=eq.${encodeURIComponent(referenceNumber)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            delivery_email_error: error.message || "Delivery email failed.",
          }),
        });
      }
    }

    sendJson(res, 200, { received: true });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Webhook failed." });
  }
}
