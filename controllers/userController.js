const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.getUser = async (req, res) => {
  try {
    const user = await User.find({ role: "admin" });
    if (!user) {
      return res.status(404).json({ message: "Users not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User Id is required for remove user" });
    }
    await User.findByIdAndDelete(userId);
    res
      .status(200)
      .json({ message: "User removed successfully", success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const updates = { ...req.body };

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required for updating user",
        success: false,
      });
    }

    // If password is being updated, hash it first
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // Find and update the user
    const editedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    // Check if user exists
    if (!editedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      success: true,
      user: editedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
      success: false,
      error: error.message,
    });
  }
};
