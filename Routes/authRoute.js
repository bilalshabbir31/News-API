import { Router } from "express";
import { login, register, sendTestEmail } from "../Controllers/AuthController.js";

const authRouter = Router();

authRouter.post("/auth/register", register);
authRouter.post("/auth/login", login);
authRouter.get('/send-email', sendTestEmail);
export default authRouter;
