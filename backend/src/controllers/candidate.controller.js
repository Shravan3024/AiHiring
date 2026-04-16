const { Candidate } = require("../models");

exports.createCandidateProfile = async (req, res) => {
  try {
    const { education, specialization, experience_years } = req.body;

    const existing = await Candidate.findOne({
      where: { user_id: req.user.id }
    });

    if (existing) {
      return res.status(400).json({ message: "Candidate profile already exists" });
    }

    const candidate = await Candidate.create({
      user_id: req.user.id,
      education,
      specialization,
      experience_years
    });

    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
