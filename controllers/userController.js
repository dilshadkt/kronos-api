const User = require("../models/User");

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
