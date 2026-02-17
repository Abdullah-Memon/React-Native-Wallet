import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

import "dotenv/config"

const rateRequests = process.env.RATE_LIMIT_REQUESTS || 10; // Default to 10 requests
const rateDuration = process.env.RATE_LIMIT_DURATION || '30 s'; // Default to 30 seconds

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(rateRequests, rateDuration),
})

export default rateLimiter
