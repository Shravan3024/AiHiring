const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const {
  createOffer,
  respondOffer,
  // TODO: getOfferDetails not yet implemented in offer controller
  // getOfferDetails
} = require("../controllers/offer.controller");

/* HR/Admin creates offer */
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["HR", "ADMIN"]),
  createOffer
);

// TODO: getOfferDetails not yet implemented
// /* Candidate sees offer details */
// router.get(
//   "/application/:applicationId",
//   authMiddleware,
//   roleMiddleware(["CANDIDATE"]),
//   getOfferDetails
// );

/* Candidate responds to offer */
router.post(
  "/application/:applicationId/respond",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  respondOffer
);

module.exports = router;
