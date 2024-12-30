const express = require("express");
const axios = require("axios");
require("dotenv").config();

class TPStreamsService {
  constructor() {
    this.baseUrl = "https://app.tpstreams.com/api";
    this.organizationId = process.env.TPSTREAMS_ORG_ID;
    this.authToken = null;
  }

  async getAuthToken() {
    if (this.authToken) {
      return this.authToken;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/auth/login/`, {
        username: process.env.TPSTREAMS_USERNAME,
        password: process.env.TPSTREAMS_PASSWORD,
        organization_id: this.organizationId,
      });

      this.authToken = response.data.token;
      return this.authToken;
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getVideos() {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `${this.baseUrl}/v1/${this.organizationId}/assets/`,
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );

      return response.data.results;
    } catch (error) {
      throw new Error(`Failed to fetch videos: ${error.message}`);
    }
  }

  organizeByLevel(videos) {
    const folderMap = new Map();
    const result = {
      beginner: [],
      intermediate: [],
      advanced: [],
    };

    // First, identify all folders
    videos.forEach((item) => {
      if (item.type === "folder") {
        folderMap.set(item.id, item.title.toLowerCase());
      }
    });

    // Then organize videos by their parent folder
    videos.forEach((item) => {
      if (item.type === "video" && item.parent_id) {
        const parentFolder = folderMap.get(item.parent_id);
        if (parentFolder && result.hasOwnProperty(parentFolder)) {
          result[parentFolder].push({
            title: item.title,
            id: item.id,
            type: item.type,
            video: item.video,
            drm_content_id: item.drm_content_id,
            views_count: item.views_count,
            average_watched_time: item.average_watched_time,
            total_watch_time: item.total_watch_time,
            unique_viewers_count: item.unique_viewers_count,
          });
        }
      }
    });

    return result;
  }
}
const tpStreamsService = new TPStreamsService();
exports.getVideos = async (req, res) => {
  try {
    const videos = await tpStreamsService.getVideos();
    const organizedVideos = tpStreamsService.organizeByLevel(videos);
    res.json(organizedVideos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
