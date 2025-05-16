const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

const generateToken = async (username, tutorId) => {
  return jwt.sign({ username, tutorId }, SECRET_KEY, { expiresIn: "2h" });
};

const checkToken = async (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

module.exports = {
  generateToken,
  checkToken,
};
