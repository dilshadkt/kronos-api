const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

// Token generation with session tracking
const generateToken = (user) => {
  const expiresIn = "1h";
  const sessionId = require("crypto").randomBytes(32).toString("hex");

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      sessionId: sessionId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
    },
    process.env.JWT_SECRET
  );

  return { token, sessionId };
};

// Register User
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({
      username,
      email,
      password,
      activeSession: null,
      lastLoginTime: null,
    });
    await user.save();
    const users = await User.find({ role: "admin" });
    res
      .status(201)
      .json({ message: "User registered successfully", data: users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If user already has an active session
    if (user.role === "admin" && user.activeSession) {
      return res.status(403).json({
        message:
          "Account is already logged in on another device. Please log out from other sessions first.",
        timestamp: user.lastLoginTime,
      });
    }

    // Generate new token and session
    const { token, sessionId } = generateToken(user);

    // Update user's session status
    await User.findByIdAndUpdate(user._id, {
      activeSession: sessionId,
      lastLoginTime: new Date(),
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // sameSite: "strict",
        sameSite: "none",
      })
      .json({
        message: "Login successful",
        user: {
          id: user._id,
          role: user.role,
          username: user.username,
          lastLoginTime: new Date(),
        },
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Logout User
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      activeSession: null,
      lastLoginTime: null,
    });

    res.clearCookie("token");
    res.json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Force logout from all sessions (optional)
exports.forceLogoutAllSessions = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      activeSession: null,
      lastLoginTime: null,
    });

    res.clearCookie("token");
    res.json({ message: "Logged out from all sessions" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return false;
  } catch (err) {
    return err.name === "TokenExpiredError";
  }
};

// Clear session for user
const clearUserSession = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    activeSession: null,
    lastLoginTime: null,
  });
};

// Middleware to check session status
exports.checkSessionStatus = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (token && isTokenExpired(token)) {
      // If token is expired, decode it anyway to get the user ID
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        await clearUserSession(decoded.id);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};
