import { Router } from "express";
import { index } from "../Controllers/ProfileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const profileRouter = Router();
profileRouter.use(authMiddleware);
profileRouter.get("/profile", index);

export default profileRouter;
