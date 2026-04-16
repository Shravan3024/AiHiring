const { Candidate, Application, NotificationQueue } = require("./src/models");

async function test() {
  try {
    console.log("Checking Candidate...");
    const candidate = await Candidate.findOne();
    if (!candidate) return console.log("No candidates found in DB. Test stops.");
    
    console.log("Candidate found:", candidate.id);
    
    console.log("Checking Applications query...");
    await Application.findAll({
      where: { candidate_id: candidate.id },
      order: [["created_at", "DESC"]],
      limit: 5
    });
    console.log("✅ Applications query SUCCESS");

    console.log("Checking Notifications query...");
    await NotificationQueue.count({
      where: {
        candidate_id: candidate.id,
        status: "PENDING"
      }
    });
    console.log("✅ Notifications query SUCCESS");

  } catch (e) {
    console.error("❌ ERROR DETECTED:");
    console.error(e.message);
  }
}

test();
