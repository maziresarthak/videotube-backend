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

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    {
      $pull: {
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
    .json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const playlists = await Playlist.find({
    owner: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists retrieved successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist retrieved successfully"));
});

const updatePlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(400, "Please provide a name and description");
  }

  const playlist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    {
      $set: {
        name: name.trim(),
        description: description.trim(),
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
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

const deletePlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you are not the owner of this playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

export {
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylistById,
  deletePlaylistById,
};
