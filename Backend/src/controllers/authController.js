const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, username, password, name, phone, address } = req.body; // Validation

    if (!email || !username || !password || !name) {
      return res
        .status(400)
        .json({ error: "Email, username, password và name là bắt buộc" });
    } // Check if user exists

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: "Email hoặc username đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      name,
      phone: phone || "",
      address: address || "",
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email và password là bắt buộc" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Email hoặc password không đúng" });

    const valid = await bcrypt.compare(password, user.password); // ĐÃ KHẮC PHỤC LỖI
    if (!valid)
      return res.status(400).json({ error: "Email hoặc password không đúng" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ token, user: userResponse });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.logout = (req, res) => {
  // For JWT, logout is handled client-side by removing token
  res.json({ message: "Logged out" });
};
