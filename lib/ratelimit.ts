// -----------------------------
// 10) lib/ratelimit.ts  (IP başı hız limiti)
// -----------------------------
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // dakikada 5 istek
  analytics: true
});