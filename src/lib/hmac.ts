// lib/hmac.ts

export interface HmacAuthHeaders {
  "X-Api-Key": string;
  "X-Timestamp": string;
  "X-Signature": string;
}

/**
 * Generate HMAC-SHA256 signature for public API authentication
 * Using Web Crypto API - compatible with Node.js, Edge Runtime, and Browser
 */
export async function generateHmacAuthHeaders(
  apiKey: string,
  secretKey: string
): Promise<HmacAuthHeaders> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = `${timestamp}|${apiKey}`;

  // Import secret key
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const payloadData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign the payload
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, payloadData);

  // Convert ArrayBuffer to Base64
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signature = btoa(String.fromCharCode(...signatureArray));

  return {
    "X-Api-Key": apiKey,
    "X-Timestamp": timestamp,
    "X-Signature": signature,
  };
}