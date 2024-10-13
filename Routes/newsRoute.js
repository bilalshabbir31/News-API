import { Router } from "express";
import { create, destroy, index, show, update } from "../Controllers/NewsController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const newRouter = Router();

newRouter.use(authMiddleware);
newRouter.get("/news", index);
newRouter.post("/news", create);
newRouter.get("/news/:id", show);
newRouter.put("/news/:id", update);
newRouter.delete("/news/:id", destroy);
export default newRouter;
