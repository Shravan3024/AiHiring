const bcrypt = require("bcryptjs");
const { User, Candidate } = require("../src/models");

async function seed() {
  try {
    const users = [
      { name: "Admin Demo", email: "admin@example.com", pass: "password123", role: "ADMIN" },
      { name: "HR Demo", email: "hr@example.com", pass: "password123", role: "HR" },
      { name: "Candidate Demo", email: "candidate@example.com", pass: "password123", role: "CANDIDATE" }
    ];

    for (let u of users) {
      let existing = await User.findOne({ where: { email: u.email } });
      const hashed = await bcrypt.hash(u.pass, 10);
      if (!existing) {
        existing = await User.create({ name: u.name, email: u.email, password: hashed, role: u.role });
        console.log(`Created ${u.email}`);
      } else {
        await existing.update({ password: hashed, role: u.role });
        console.log(`Updated ${u.email}`);
      }

      // If Candidate, ensure email_verified is true so they don't get blocked
      if (u.role === "CANDIDATE") {
        let cand = await Candidate.findOne({ where: { user_id: existing.id } });
        if (!cand) {
          await Candidate.create({ 
            user_id: existing.id, 
            email_verified: true, 
            education: "Demo Univ", 
            specialization: "Computer Science",
            experience_years: 2
          });
          console.log(`Created candidate profile for ${u.email}`);
        } else {
          await cand.update({ email_verified: true });
          console.log(`Updated candidate profile for ${u.email}`);
        }
      }
    }
    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
