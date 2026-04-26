const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const {
  createOffer,
  respondOffer,
  getOfferDetails
} = require("../controllers/offer.controller");

/* HR/Admin creates offer */
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["HR", "ADMIN"]),
  createOffer
);

/* Candidate sees offer details */
router.get(
  "/application/:applicationId",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  getOfferDetails
);

/* Candidate responds to offer */
router.post(
  "/respond-to-offer",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  respondOffer
);

module.exports = router;
