// Small Web Crypto helpers (Workers runtime and browsers both have crypto.subtle).

const enc = new TextEncoder();

export function b64url(bytes: Uint8Array | string): string {
  const b = typeof bytes === 'string' ? enc.encode(bytes) : bytes;
  let s = '';
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(s: string): string {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(pad);
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
}

/** URL-safe random token with `bytes` bytes of entropy. */
export const randomToken = (bytes = 32) => b64url(crypto.getRandomValues(new Uint8Array(bytes)));

export async function sha256hex(s: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
  return [...d].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** PKCE S256 challenge for a verifier. */
export async function pkceChallenge(verifier: string): Promise<string> {
  return b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(verifier))));
}

const hmacKey = (secret: string) =>
  crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

export async function sign(secret: string, data: string): Promise<string> {
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(data))));
}

/** Constant-time verification via crypto.subtle.verify. */
export async function verify(secret: string, data: string, sig: string): Promise<boolean> {
  try {
    const raw = Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((sig.length + 3) % 4)), (c) => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', await hmacKey(secret), raw, enc.encode(data));
  } catch {
    return false;
  }
}
