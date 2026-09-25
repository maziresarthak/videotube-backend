import { Router } from "express";
import { getUserChannelSubscribers } from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId").get(getUserChannelSubscribers);

export default router;
