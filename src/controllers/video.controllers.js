import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishAVideo = asyncHandler(async (req, res) => {
  const owner = req.user;

  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Please provide title and description");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Please provide video and thumbnail");
  }

  let videoFile;
  try {
    videoFile = await uploadOnCloudinary(videoFileLocalPath);
    console.log("Uploaded video file", videoFile);
  } catch (error) {
    console.log("Error uploading video file", error);
    throw new ApiError(500, "Failed to upload video file");
  }

  let thumbnail;
  try {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("Uploaded thumbnail", thumbnail);
  } catch (error) {
    console.log("Error uploading thumbnail", error);

    if (videoFile) {
      await deleteFromCloudinary(videoFile.public_id);
    }

    throw new ApiError(500, "Failed to upload thumbnail");
  }

  try {
    const video = await Video.create({
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      title: title.trim(),
      description: description.trim(),
      duration: videoFile.duration,
      owner: owner._id,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, video, "Video created successfully"));
  } catch (error) {
    console.log("Error creating video", error);

    if (videoFile) {
      await deleteFromCloudinary(videoFile.public_id);
    }

    if (thumbnail) {
      await deleteFromCloudinary(thumbnail.public_id);
    }

    throw new ApiError(500, "Something went wrong when creating video");
  }
});

export { publishAVideo };
