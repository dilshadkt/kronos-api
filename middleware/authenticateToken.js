const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token; // Assuming token is stored in cookies
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    const currentUser = await User.findById(user.id);
    if (user?.sessionId === currentUser.activeSession) {
      next();
    } else {
      return res.status(401).json({ message: "Already has another user" });
    }
  });
};

module.exports = authenticateToken;
