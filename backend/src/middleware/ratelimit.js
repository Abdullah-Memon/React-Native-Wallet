import rateLimiter from "../config/upstash.js";

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const ip = req.ip; // Get the client's IP address or we can use user_id if we want to limit based on user instead of IP
    const { success } = await rateLimiter.limit(ip); // Check if the IP has exceeded the rate limit
    if (!success) {
      return res
        .status(429)
        .json({ error: "Too many requests. Please try again later." });
    }
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error in rate limit middleware:", error);
    next(error); // Pass the error to the next middleware (error handler)
  }
};

export default rateLimitMiddleware;
