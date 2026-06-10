// Convert a hex string to a Uint8Array
function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Convert a Uint8Array to a base64 string
function bytesToBase64(bytes) {
  let binString = "";
  for (let i = 0; i < bytes.length; i++) {
    binString += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binString);
}

// Convert a base64 string to a Uint8Array
function base64ToBytes(base64) {
  const binString = window.atob(base64);
  const bytes = new Uint8Array(binString.length);
  for (let i = 0; i < binString.length; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes;
}

// Import the raw hex key as an AES-GCM CryptoKey
async function importKey(hexKey) {
  const rawKey = hexToBytes(hexKey);
  return window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(data, hexKey) {
  if (!hexKey) {
    console.warn("No encryption key provided, returning raw data.");
    return data;
  }
  try {
    const key = await importKey(hexKey);
    const jsonStr = JSON.stringify(data);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(jsonStr);
    
    // Generate a 12-byte IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedData
    );
    
    // Construct payload: iv + ciphertext
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    
    return bytesToBase64(combined);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

export async function decryptData(payload, hexKey) {
  if (!hexKey) {
    console.warn("No encryption key provided, returning raw payload.");
    return payload;
  }
  // If the payload is already an object/array, return it as-is
  if (typeof payload !== "string") {
    return payload;
  }
  try {
    const key = await importKey(hexKey);
    const combined = base64ToBytes(payload);
    
    // Extract IV (first 12 bytes)
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    console.warn("Failed to decrypt data, returning raw payload. Error:", error);
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }
}
