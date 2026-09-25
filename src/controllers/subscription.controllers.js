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

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id");
  }

  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate({
    path: "channel",
    select: "_id fullname username avatar",
  });

  if (subscriptions.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No channels found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscriptions, "Channels found"));
});

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel does not exist");
  }

  const subscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (subscription) {
    await subscription.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Unsubscribed successfully"));
  }

  const newSubscription = await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
});

export { getUserChannelSubscribers, getSubscribedChannels, toggleSubscription };
