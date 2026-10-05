/**
 * Small in-memory limiter for the public license endpoints. It is per server instance,
 * which is enough to slow down key guessing; add a shared store if you scale out.
 */
const hits = new Map<string, number[]>();

export function rateLimit(id: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(id, recent);

  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return recent.length <= limit;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
