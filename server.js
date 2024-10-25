import express from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import fileUpload from "express-fileupload";
import authRouter from "./Routes/authRoute.js";
import profileRouter from "./Routes/profileRoute.js";
import newRouter from "./Routes/newsRoute.js";
import { limiter } from "./config/rateLimiter.js";
import "./jobs/job.js"

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(fileUpload());
app.use(helmet());
app.use(cors());
app.set("trust proxy", true);
app.use(limiter);

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to News API" });
});

app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", newRouter);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
