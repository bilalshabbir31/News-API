import redis from "express-redis-cache";

const redisCache = redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  prefix: "backend",
  expire: 60 * 60,
  enableReadyCheck: true,
});

export default redisCache;
