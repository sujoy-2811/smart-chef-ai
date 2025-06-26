import User from "../models/User.js";
import UserPreference from "../models/UserPreference.js";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );
};

// Register a new user
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = await User.create(name, email, password);

    // Initialize user preferences with default values
    await UserPreference.upsert(newUser.id, {
      dietary_restrictions: [],
      allergies: [],
      preferred_cuisines: [],
      default_serving_size: 4,
      measurement_units: "metric",
    });

    // GENERATE TOKEN
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Error in register:", err);
    next(err);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // VERIFY PASSWORD
    const IsPasswordValid = await User.verifyPassword(password, user.password);
    if (!IsPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // GENERATE TOKEN
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (err) {
    console.error("Error in login:", err);
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    next(err);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide an email address" });
    }

    const user = await User.findByEmail(email);

    // Dont't reveal if user exists or not for security reasons
    res.json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent",
    });

    // TODO: Implement email sending logic with a password reset token
  } catch (err) {
    console.error("Error in requestPasswordReset:", err);
    next(err);
  }
};
