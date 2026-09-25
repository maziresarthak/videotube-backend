import { Router } from "express";
import {
  createPlaylist,
  addVideoToPlaylist,
} from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

export default router;
