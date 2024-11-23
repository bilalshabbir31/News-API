import { Router } from "express";
import { login, register, sendTestEmail, verifyOtp } from "../Controllers/AuthController.js";

const authRouter = Router();

authRouter.post("/auth/register", register);
authRouter.post("/auth/login", login);
authRouter.post("/auth/verify-otp", verifyOtp);
authRouter.get('/send-email', sendTestEmail);
export default authRouter;
