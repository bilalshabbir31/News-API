import { Router } from "express";
import { register } from "../Controllers/AuthController.js";

const authRouter = Router();

authRouter.post("/auth/register", register)

export default authRouter;