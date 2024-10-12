import { Router } from "express";
import { index, update } from "../Controllers/ProfileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const profileRouter = Router();
profileRouter.use(authMiddleware);
profileRouter.get("/profile", index);
profileRouter.put('/profile/:id', update);

export default profileRouter;
