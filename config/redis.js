import redis from "express-redis-cache";

const redisCache = redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  auth_pass: process.env.REDIS_PASSWORD,
  prefix: "backend",
  expire: 60 * 60,
});

redisCache.on("connect", () => {
  console.log("Connected to Redis");
});

redisCache.on("error", (err) => {
  console.log("Redis Error:", err);
});

export default redisCache;
