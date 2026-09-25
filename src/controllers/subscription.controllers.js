import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const subscriptions = await Subscription.find({
    channel: channelId,
  }).populate({
    path: "subscriber",
    select: "_id fullname username avatar",
  });

  if (subscriptions.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No subscribers found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscriptions, "Subscribers found"));
});

export { getUserChannelSubscribers };
