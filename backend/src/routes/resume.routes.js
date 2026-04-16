const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth.middleware");
const resumeController = require("../controllers/resume.controller");

const fs = require('fs');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/resumes/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// POST /api/resume/upload
router.post(
  "/upload",
  auth,
  upload.single("resume"),
  resumeController.uploadResume
);

// TODO: reparseResume function not yet implemented
// POST /api/resume/reparse/:applicationId
// router.post(
//   "/reparse/:applicationId",
//   auth,
//   // role(["HR", "ADMIN"]), // Add role check if possible, or assume auth covers it for now
//   resumeController.reparseResume
// );

module.exports = router;