import crypto from "crypto";

export function generateToken(): string {
    // Generate cryptographically secure random token
    // 32 bytes = 256 bits of entropy, encoded as URL-safe base64
    const randomBytes = crypto.randomBytes(32);
    return randomBytes
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}
