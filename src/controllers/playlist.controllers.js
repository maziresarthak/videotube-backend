import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const owner = req.user;

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Please provide a name and description");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: owner._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }

  const video = await Video.findOne({
    _id: videoId,
    isPublished: true,
  });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you are not the owner of this playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

export { createPlaylist, addVideoToPlaylist };
