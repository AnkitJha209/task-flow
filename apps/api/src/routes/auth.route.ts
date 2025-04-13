import { Router } from "express";
import { signin, signup } from "../controllers/auth.controller.js";
import { verifyManager, verifyToken } from "../middleware/auth.middleware.js";
import { createProject, inviteToProject, joinProject } from "../controllers/project.controller.js";


export const router: Router = Router();


router.post("/auth/signin", signin);
router.post("/auth/signup", signup);


router.post('/create-project', verifyToken, verifyManager, createProject)
router.post('/invite-to-project', verifyToken, verifyManager, inviteToProject)
router.post('/join-project', verifyToken, joinProject)

export default router;