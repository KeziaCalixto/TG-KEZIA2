import { NextResponse } from "next/server";

export function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  // Next.js may normalize the proxy URL to localhost. Restore only a loopback
  // Host on the same port; never trust forwarded hosts or arbitrary redirects.
  const loopback = ["localhost", "127.0.0.1", "[::1]"];
  if (url.protocol === "http:" && loopback.includes(url.hostname)) {
    const suffix = url.port ? `:${url.port}` : "";
    const host = request.headers.get("host");
    if (host && loopback.some((name) => host === `${name}${suffix}`))
      return `http://${host}`;
  }
  return url.origin;
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === requestOrigin(request);
}

export async function readJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return null;
  if (Number(request.headers.get("content-length") ?? 0) > 32_768) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32_768) {
        await reader.cancel();
        return null;
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const value: unknown = JSON.parse(text);
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export function credentials(body: Record<string, unknown> | null) {
  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  )
    return null;
  const email = body.email.trim();
  const password = body.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return null;
  if (password.length < 8 || password.length > 128) return null;
  return { email, password };
}
