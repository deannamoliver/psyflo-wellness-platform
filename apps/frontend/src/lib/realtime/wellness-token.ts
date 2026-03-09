import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_SECONDS = 60 * 10;

type WellnessTokenPayload = {
  userId: string;
  handoffId: string;
  exp: number;
};

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(input: string, secret: string): string {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

function getTokenSecret(): string {
  const secret = process.env["PARTYKIT_TOKEN_SECRET"];
  if (!secret) {
    throw new Error("Missing PARTYKIT_TOKEN_SECRET");
  }
  return secret;
}

export function createWellnessToken(input: {
  userId: string;
  handoffId: string;
  ttlSeconds?: number;
}): string {
  const ttlSeconds = input.ttlSeconds ?? DEFAULT_TTL_SECONDS;
  const payload: WellnessTokenPayload = {
    userId: input.userId,
    handoffId: input.handoffId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload, getTokenSecret());
  return `${encodedPayload}.${signature}`;
}

export function verifyWellnessToken(
  token: string,
): WellnessTokenPayload | null {
  const secret = getTokenSecret();
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload, secret);
  if (signature.length !== expectedSignature.length) return null;
  const isValidSignature = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
  if (!isValidSignature) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as WellnessTokenPayload;
    if (!payload.userId || !payload.handoffId || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
