import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const totalVideos = await Video.countDocuments({
    owner: req.user?._id,
  });

  const totalViewsResult = await Video.aggregate([
    {
      $match: {
        owner: req.user._id,
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]);

  const totalSubscribers = await Subscription.countDocuments({
    channel: req.user?._id,
  });

  const videoIds = await Video.distinct("_id", {
    owner: req.user._id,
  });

  const totalLikes = await Like.countDocuments({
    video: {
      $in: videoIds,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        totalViews: totalViewsResult[0]?.totalViews || 0,
        totalSubscribers,
        totalLikes,
      },
      "Channel stats"
    )
  );
});

export { getChannelStats };
