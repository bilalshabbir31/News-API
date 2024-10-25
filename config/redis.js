import redis from "express-redis-cache";

const redisCache = redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  auth_pass: process.env.REDIS_PASSWORD,
  prefix: "backend",
  expire: 60 * 60,
});

redisCache.client.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redisCache;
