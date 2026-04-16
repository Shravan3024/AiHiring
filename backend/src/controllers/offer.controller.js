const { Offer, Application, Notification } = require("../models");

/* =============================
   HR CREATES OFFER
============================= */
exports.createOffer = async (req, res) => {
  try {
    const { application_id, salary, joining_date } = req.body;

    const application = await Application.findByPk(application_id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const offer = await Offer.create({
      application_id,
      salary,
      joining_date,
      status: "PENDING"
    });

    application.status = "OFFERED";
    await application.save();

    await Notification.create({
      role: "CANDIDATE",
      message: "You have received a job offer 🎉"
    });

    res.json({ message: "Offer created", offer });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   CANDIDATE RESPONDS TO OFFER
============================= */
exports.respondOffer = async (req, res) => {
  try {
    const { offer_id, decision } = req.body;

    // Validate decision input
    const validDecisions = ["ACCEPTED", "REJECTED"];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        message: "Invalid decision. Must be 'ACCEPTED' or 'REJECTED'"
      });
    }

    const offer = await Offer.findByPk(offer_id, {
      include: [Application]
    });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Check if offer is still pending
    if (offer.status !== "PENDING") {
      return res.status(400).json({
        message: "Offer has already been responded to"
      });
    }

    offer.status = decision;
    await offer.save();

    offer.Application.status =
      decision === "ACCEPTED" ? "HIRED" : "OFFER_REJECTED";

    await offer.Application.save();

    res.json({ message: "Offer response recorded", offer });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
