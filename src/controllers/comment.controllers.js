import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Please add a comment");
  }

  const owner = req.user;

  const comment = await Comment.create({
    content: content.trim(),
    video: videoId,
    owner: owner._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const video = await Video.findOne({
    _id: videoId,
    isPublished: true,
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const commentAggregation = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 1,
              fullname: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $arrayElemAt: ["$owner", 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        video: 1,
        owner: 1,
        createdAt: 1,
      },
    },
  ]);

  const options = {
    page: Number(page),
    limit: Number(limit),
  };

  const result = await Comment.aggregatePaginate(commentAggregation, options);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully"));
});

export { addComment, getVideoComments };
