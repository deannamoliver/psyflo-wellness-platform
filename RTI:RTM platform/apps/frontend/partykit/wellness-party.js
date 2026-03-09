import { createHmac, timingSafeEqual } from "node:crypto";

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(input, secret) {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

function safeCompare(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function verifyToken(token, secret) {
  if (!token || !secret) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expected = sign(encodedPayload, secret);
  if (!safeCompare(signature, expected)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload));
    if (!payload?.handoffId || !payload?.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export default class WellnessPartyServer {
  async onConnect(conn, ctx) {
    const requestUrl = new URL(ctx.request.url);
    const token = requestUrl.searchParams.get("token");
    const payload = verifyToken(token, this.room.env.PARTYKIT_TOKEN_SECRET);
    if (!payload || payload.handoffId !== this.room.id) {
      conn.close(4001, "Unauthorized");
      return;
    }
  }

  async onRequest(req) {
    if (req.method !== "POST") {
      return new Response("ok", { status: 200 });
    }

    const secret = req.headers.get("x-partykit-secret");
    if (!secret || secret !== this.room.env.PARTYKIT_PUBLISH_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    this.room.broadcast(JSON.stringify(payload));
    return new Response("ok", { status: 200 });
  }
}
