// Simple in-memory rate limiter
const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a request is rate limited.
 * @param key - unique key (e.g. IP address)
 * @param maxAttempts - max attempts in the window
 * @param windowMs - time window in milliseconds
 * @returns remaining attempts, or 0 if blocked
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxAttempts - entry.count };
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) attempts.delete(key);
  }
}, 5 * 60 * 1000).unref();
