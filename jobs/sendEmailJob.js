import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/queue.js";
import logger from "../config/logger.js";
import { sendEmail } from "../config/mailer.js";

// Queue
export const emailQueueName = "mailer-queue";

export const emailQueue = new Queue(emailQueueName, {
  connection: redisConnection,
  defaultJobOptions: defaultQueueConfig,
});

// Worker
export const handler = new Worker(
  emailQueueName,
  async (job) => {
    console.log("the email worker data is: ", job.data);
    const data = job.data;
    data?.map(async (item) => {
      await sendEmail(item.toEmail, item.subject, item.body);
    });
  },
  { connection: redisConnection }
);

// worker listensers

handler.on("completed", (job) => {
  logger.info({ job: job, message: "Job Completed" });
  console.log(`the job ${job.id} is completed`);
});

handler.on("failed", (job) => {
  logger.error({ job: job, message: "Job failed" });
  console.log(`the job ${job.id} is failed`);
});
