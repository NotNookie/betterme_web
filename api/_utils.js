import crypto from "node:crypto";
import { products } from "../src/data/products.js";

const jsonHeaders = { "Content-Type": "application/json" };

export function sendJson(res, status, payload) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(payload));
}

export function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

export function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function getSiteUrl(req) {
  const configuredUrl = process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
  }

  const host = req.headers.host || "localhost:5173";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  return `${protocol}://${host}`;
}

export function getProductId(product) {
  return product.url.split("/").filter(Boolean).pop();
}

export function getProductAmount(product) {
  const price = Number(String(product.price).replace(/[^\d.]/g, ""));
  return Math.round(price * 100);
}

export function findProduct(productId) {
  return products.find((product) => getProductId(product) === productId);
}

export function createReferenceNumber() {
  const random = crypto.randomBytes(16).toString("hex").toUpperCase();
  return `BMD-${Date.now()}-${random}`;
}

export function hashAccessToken(token) {
  if (!token) {
    return null;
  }

  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getPaymentMethodTypes() {
  const configuredTypes = process.env.PAYMONGO_PAYMENT_METHOD_TYPES || "gcash,paymaya,card,qrph";
  return configuredTypes
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean);
}

export async function supabaseRequest(path, options = {}) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.hint || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getDeliveryLink(productId) {
  if (!process.env.PRODUCT_DELIVERY_LINKS_JSON) {
    return null;
  }

  try {
    const links = JSON.parse(process.env.PRODUCT_DELIVERY_LINKS_JSON);
    return links[productId] || null;
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendDeliveryEmail({ customerEmail, productTitle, referenceNumber, downloadUrl }) {
  if (!downloadUrl) {
    return { skipped: true, reason: "No delivery link is configured for this product." };
  }

  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
    return { skipped: true, reason: "Resend email environment variables are not configured." };
  }

  const safeProductTitle = escapeHtml(productTitle);
  const safeReferenceNumber = escapeHtml(referenceNumber);
  const safeDownloadUrl = escapeHtml(downloadUrl);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL,
      to: customerEmail,
      subject: `Your Better Me Digitals order ${referenceNumber}`,
      text: [
        "Thank you for your purchase.",
        "",
        `Your ${productTitle} download is ready:`,
        downloadUrl,
        "",
        `Order reference: ${referenceNumber}`,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #12352a;">
          <p>Thank you for your purchase.</p>
          <p>Your <strong>${safeProductTitle}</strong> download is ready:</p>
          <p>
            <a href="${safeDownloadUrl}" style="display: inline-block; padding: 12px 18px; background: #0b5c34; color: #ffffff; text-decoration: none; border-radius: 6px;">
              Open your digital product
            </a>
          </p>
          <p>If the button does not work, copy and paste this link into your browser:</p>
          <p><a href="${safeDownloadUrl}">${safeDownloadUrl}</a></p>
          <p>Order reference: ${safeReferenceNumber}</p>
        </div>
      `,
    }),
  });

  const responseText = await response.text();
  let data = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = { message: responseText };
  }

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return { skipped: false, id: data?.id || null };
}
