"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Data structure for signup information temporarily stored in encrypted cookie
 */
export type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  timezone: string;
};

const COOKIE_NAME = "__Host-signup-data";
const COOKIE_MAX_AGE = 3600; // 1 hour

/**
 * Get the encryption secret from environment variable
 * Generate a new secret with: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
 */
function getEncryptionSecret(): Buffer {
  const secret = process.env["SIGNUP_COOKIE_SECRET"];

  if (!secret) {
    throw new Error(
      "SIGNUP_COOKIE_SECRET environment variable is not set. " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  if (secret.length !== 64) {
    throw new Error(
      "SIGNUP_COOKIE_SECRET must be a 64-character hex string (32 bytes). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  return Buffer.from(secret, "hex");
}

/**
 * Encrypt signup data using AES-256-GCM
 */
function encrypt(data: SignupData): string {
  const secret = getEncryptionSecret();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", secret, iv);

  const jsonData = JSON.stringify(data);
  let encrypted = cipher.update(jsonData, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Combine iv + authTag + encrypted data, all in hex
  return iv.toString("hex") + authTag.toString("hex") + encrypted;
}

/**
 * Decrypt signup data using AES-256-GCM
 */
function decrypt(encryptedData: string): SignupData {
  const secret = getEncryptionSecret();

  // Extract iv (first 32 hex chars = 16 bytes), authTag (next 32 hex chars = 16 bytes), and encrypted data
  const iv = Buffer.from(encryptedData.slice(0, 32), "hex");
  const authTag = Buffer.from(encryptedData.slice(32, 64), "hex");
  const encrypted = encryptedData.slice(64);

  const decipher = crypto.createDecipheriv("aes-256-gcm", secret, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted) as SignupData;
}

/**
 * Store signup data in an encrypted, HTTP-only cookie
 * This is used to securely pass signup information from the initial form
 * to the school setup wizard without exposing sensitive data in URL parameters.
 */
export async function setSignupCookie(data: SignupData): Promise<void> {
  const encryptedData = encrypt(data);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, encryptedData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/sign-up",
  });
}

/**
 * Retrieve and decrypt signup data from cookie
 * Returns null if cookie doesn't exist or decryption fails
 */
export async function getSignupCookie(): Promise<SignupData | null> {
  const cookieStore = await cookies();
  const encryptedData = cookieStore.get(COOKIE_NAME)?.value;

  if (!encryptedData) {
    return null;
  }

  try {
    return decrypt(encryptedData);
  } catch (error) {
    // Cookie may be tampered with or encrypted with different secret
    console.error("Failed to decrypt signup cookie:", error);

    // Delete invalid cookie
    await deleteSignupCookie();

    return null;
  }
}

/**
 * Delete the signup cookie
 * This should be called after successfully reading the cookie to prevent reuse
 */
export async function deleteSignupCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
