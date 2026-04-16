const express = require("express");
const {
  register,
  login,
  logout,
  verifyOTP,
  resendOTP,
  updateProfile,
  changePassword
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { User } = require("../models");

const validate = require("../middleware/validate.middleware");
const {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
} = require("../validations/auth.validation");
const { paginationSchema } = require("../validations/hr.validation");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/verify-otp", validate(verifyOTPSchema), verifyOTP);
router.post("/resend-otp", resendOTP);

// 🔐 Protected logout route
router.post("/logout", authMiddleware, logout);

// 🔐 Profile & password
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

// 🔐 Admin: list all users
router.get("/users", authMiddleware, roleMiddleware(["ADMIN"]), validate(paginationSchema), async (req, res) => {
  try {
    const { page = 1, limit = 10, role: roleFilter } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (roleFilter) where.role = roleFilter;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ["id", "name", "email", "role", "status", "createdAt"],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const mapped = users.map(u => ({ ...u.toJSON(), _id: String(u.id) }));
    res.json({
      success: true,
      data: mapped,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        limit,
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;