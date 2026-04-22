const { Offer, Application, Notification, Job } = require("../models");

/* =============================
   HR CREATES OFFER
============================= */
exports.createOffer = async (req, res) => {
  try {
    const { application_id, salary, joining_date, position_title, offer_letter_content, expires_at, benefits } = req.body;

    const application = await Application.findByPk(application_id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const offer = await Offer.create({
      application_id,
      salary,
      joining_date,
      position_title,
      offer_letter_content,
      expires_at,
      benefits,
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
  console.log("🎯 respondOffer hit:", req.body);
  try {
    const { offer_id, application_id, decision, candidate_notes } = req.body;
    
    if (!offer_id && !application_id) {
      return res.status(400).json({ message: "Offer ID or Application ID is required" });
    }

    let offer;
    if (offer_id) {
      offer = await Offer.findByPk(offer_id, { include: [{ model: Application, as: "application" }] });
    } else if (application_id) {
      offer = await Offer.findOne({ 
        where: { application_id }, 
        include: [{ model: Application, as: "application" }] 
      });
    }

    if (!offer && application_id) {
      // Fallback: If offer record is missing but application is in an offer-ready state, create it
      const application = await Application.findByPk(application_id, { include: [Job] });
      if (application && ["SELECTED", "OFFER_SENT", "OFFERED"].includes(application.status)) {
        console.log("🛠️ Auto-creating missing offer record for application:", application_id);
        offer = await Offer.create({
          application_id: application.id,
          salary: 0, // Default for missing records
          joining_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          position_title: application.Job?.title || "Position",
          status: "PENDING"
        });
        // Re-fetch with association
        offer = await Offer.findByPk(offer.id, { include: [{ model: Application, as: "application" }] });
      }
    }

    if (!offer) {
      return res.status(404).json({ message: "Offer record not found and cannot be auto-created. Please ensure the candidate has been sent an offer letter." });
    }

    // Validate decision input
    const validDecisions = ["ACCEPTED", "REJECTED"];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        message: "Invalid decision. Must be 'ACCEPTED' or 'REJECTED'"
      });
    }

    // Check if offer is still pending
    if (offer.status !== "PENDING") {
      return res.status(400).json({
        message: "Offer has already been responded to"
      });
    }

    offer.status = decision;
    offer.candidate_notes = candidate_notes;
    offer.responded_at = new Date();
    await offer.save();

    if (offer.application) {
      offer.application.status = decision === "ACCEPTED" ? "HIRED" : "OFFER_REJECTED";
      await offer.application.save();
    }

    res.json({ message: "Offer response recorded", offer });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
