import { Router } from "express";
import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/:videoId").post(addComment).get(getVideoComments);
router.route("/c/:commentId").patch(updateComment).delete(deleteComment);

export default router;
