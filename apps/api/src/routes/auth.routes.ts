import { Router } from "express";
import { signin, signup } from "../controllers/auth.controller.js";


export const router: Router = Router();


router.post("/signin", signin);
router.post("/signup", signup);

export default router;
