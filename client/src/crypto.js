// End-to-end encryption for private chats, using the browser's built-in Web Crypto API.
// Each user has an ECDH key pair. Two people combine their own private key with the other
// person's public key to get the same AES key, which never leaves either browser.
import api from "./api/axios.js";

const subtle = globalThis.crypto.subtle;
const ecdh = { name: "ECDH", namedCurve: "P-256" };

function toBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(text) {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
}

async function passwordKey(password, salt) {
  const base = await subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function lockPrivateKey(privateKey, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await passwordKey(password, salt);
  const data = await subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(privateKey));
  return JSON.stringify({ salt: toBase64(salt), iv: toBase64(iv), data: toBase64(data) });
}

async function unlockPrivateKey(locked, password) {
  const { salt, iv, data } = JSON.parse(locked);
  const key = await passwordKey(password, fromBase64(salt));
  const plain = await subtle.decrypt({ name: "AES-GCM", iv: fromBase64(iv) }, key, fromBase64(data));
  return new TextDecoder().decode(plain);
}

export async function createKeyPair() {
  const pair = await subtle.generateKey(ecdh, true, ["deriveKey"]);
  return {
    publicKey: JSON.stringify(await subtle.exportKey("jwk", pair.publicKey)),
    privateKey: JSON.stringify(await subtle.exportKey("jwk", pair.privateKey)),
  };
}

// Runs after login or sign-up: restores this user's private key on this device,
// or creates a key pair the first time.
export async function setupKeys(password) {
  const { data } = await api.get("/auth/keys");
  let privateKey;

  if (data.encrypted_private_key) {
    privateKey = await unlockPrivateKey(data.encrypted_private_key, password);
  } else {
    const pair = await createKeyPair();
    privateKey = pair.privateKey;
    await api.put("/auth/keys", {
      public_key: pair.publicKey,
      encrypted_private_key: await lockPrivateKey(privateKey, password),
    });
  }

  localStorage.setItem("privateKey", privateKey);
}

export async function chatKey(myPrivateKey, theirPublicKey) {
  const privateKey = await subtle.importKey("jwk", JSON.parse(myPrivateKey), ecdh, false, ["deriveKey"]);
  const publicKey = await subtle.importKey("jwk", JSON.parse(theirPublicKey), ecdh, false, []);
  return subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));
  return { ciphertext: toBase64(data), iv: toBase64(iv) };
}

export async function decryptMessage(key, message) {
  const plain = await subtle.decrypt({ name: "AES-GCM", iv: fromBase64(message.iv) }, key, fromBase64(message.ciphertext));
  return new TextDecoder().decode(plain);
}
