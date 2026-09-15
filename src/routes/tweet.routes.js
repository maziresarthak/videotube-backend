import { Router } from "express";
import {
  createTweet,
  getUserTweets,
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT); // Apply the verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/t/:userId").get(getUserTweets);

export default router;
