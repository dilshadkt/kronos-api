const { uploader } = require("../config/Cloudinary");
const FileRemover = require("../config/FileRemover/FileRemover");
const affiliates = require("../models/affiliates");

const addAffiliate = async (req, res) => {
  try {
    const { name, googleFormLink } = req.body;
    let profileImage = req.file ? req.file.path : null;
    if (!name || !googleFormLink || !profileImage) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }
    // Upload image to cloudinary
    try {
      profileImage = await uploader.upload(
        file.path,
        {
          public_id: `kronos/${file.originalname}`,
          folder: "kronos",
        },
        (error) => {
          if (error) {
            throw new Error("Image upload failed");
          } else {
            FileRemover(file); // Remove temporary file
          }
        }
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload image. Please try again later",
        error: error.message,
      });
    }
    // Create new affiliates
    const newAffiliates = new affiliates({
      name: req.body.name,
      profileImage: profileImage.secure_url,
      googleFormLink: req.body.googleFormLink, // Using secure_url for HTTPS
    });

    // Save affiliates
    await newAffiliates.save();

    // Fetch all affiliates
    const updatedAffiliates = await affiliates.find().sort({
      createdAt: -1,
    });

    res.status(201).json({
      success: true,
      message: "Afiliates added successfully",
      data: updatedAffiliates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add Afiliates",
      error: error.message,
    });
  }
};
const getAfiliates = async (req, res) => {
  try {
    const updatedAfiliates = await affiliates.find();
    res.status(200).json({
      success: true,
      data: updatedAfiliates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Afiliates",
      error: error.message,
    });
  }
};
const getAfilitate = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAfiliates = await affiliates.findById(id);
    res.status(200).json({
      success: true,
      data: updatedAfiliates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch Afiliates",
      error: error.message,
    });
  }
};

// Update an affiliate
const updateAffiliate = async (req, res) => {
  try {
    let updateData = {
      name: req.body.name,
      googleFormLink: req.body.googleFormLink,
    };

    // Handle image update if new file is provided
    if (req.file) {
      const profileImage = await uploader.upload(
        req.file.path,
        {
          public_id: `kronos/${req.file.originalname}`,
          folder: "kronos",
        },
        (error) => {
          if (error) {
            throw new Error("Image upload failed");
          } else {
            FileRemover(req.file);
          }
        }
      );
      updateData.profileImage = profileImage.secure_url;
    }

    const updatedAfiliates = await affiliates.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedAfiliates) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    // Get updated list
    const allAfiliates = await affiliates.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      message: "Afiliates updated successfully",
      data: allAfiliates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update afiliates",
      error: error.message,
    });
  }
};

// Delete an affiliate
const deleteAffiliate = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAffiliate = await affiliates.findByIdAndDelete(id);

    if (!deletedAffiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    res.status(200).json({ message: "Affiliate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAfiliates,
  addAffiliate,
  getAfilitate,
  updateAffiliate,
  deleteAffiliate,
};
