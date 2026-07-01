import crypto from "node:crypto";
import { products } from "../src/data/products.js";

const jsonHeaders = { "Content-Type": "application/json" };

// Per-IP sliding-window rate limiter. State is module-scoped, so it is shared
// within a single serverless instance but not across horizontally-scaled ones.
// Good enough for burst protection on a low-traffic storefront.
const _rateLimitStore = new Map();

export function checkRateLimit(identifier, maxRequests, windowMs) {
  const now = Date.now();
  const timestamps = (_rateLimitStore.get(identifier) || []).filter(
    (t) => now - t < windowMs
  );
  if (timestamps.length >= maxRequests) {
    return false;
  }
  timestamps.push(now);
  _rateLimitStore.set(identifier, timestamps);
  return true;
}

export function sendJson(res, status, payload) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(payload));
}

export function readJson(req) {
  const MAX_BYTES = 64 * 1024; // 64 KB — enough for any checkout payload

  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    let aborted = false;

    req.on("data", (chunk) => {
      if (aborted) return;
      size += chunk.length;
      if (size > MAX_BYTES) {
        aborted = true;
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on("end", () => {
      if (aborted) return;
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

    req.on("error", (err) => {
      if (!aborted) reject(err);
    });
  });
}

export function readRawBody(req) {
  const MAX_BYTES = 1024 * 1024; // 1 MB — generous for webhook payloads

  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let aborted = false;

    req.on("data", (chunk) => {
      if (aborted) return;
      size += chunk.length;
      if (size > MAX_BYTES) {
        aborted = true;
        reject(new Error("Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(Buffer.from(chunk));
    });

    req.on("end", () => {
      if (!aborted) resolve(Buffer.concat(chunks));
    });

    req.on("error", (err) => {
      if (!aborted) reject(err);
    });
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
    console.error("[getDeliveryLink] PRODUCT_DELIVERY_LINKS_JSON is not set.");
    return null;
  }

  try {
    const links = JSON.parse(process.env.PRODUCT_DELIVERY_LINKS_JSON);
    const link = links[productId] || null;
    if (!link) {
      console.error(`[getDeliveryLink] No delivery link configured for product: ${productId}`);
    }
    return link;
  } catch (error) {
    console.error("[getDeliveryLink] Failed to parse PRODUCT_DELIVERY_LINKS_JSON:", error.message);
    return null;
  }
}
