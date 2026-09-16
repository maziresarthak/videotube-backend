import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const owner = req.user; // Assuming the user is attached to the request object by the verifyJWT middleware

  const tweet = await Tweet.create({
    content,
    owner: owner._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const userTweets = await Tweet.find({ owner: userId });

  if (userTweets.length === 0) {
    throw new ApiError(404, "User tweets not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userTweets, "User tweets retrieved successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const { content } = req.body;

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      owner: req.user?._id,
    },
    {
      $set: {
        content: content.trim(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tweet) {
    throw new ApiError(404, "Tweet not found or you are not the owner");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
