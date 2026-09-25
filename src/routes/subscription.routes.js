import { Router } from "express";
import {
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/u/:channelId").get(getUserChannelSubscribers);
router.route("/c/:subscriberId").get(getSubscribedChannels);

export default router;
