const { Application, AIDecision, Candidate, Job } = require("./src/models");

async function checkCounts() {
  try {
    const appCount = await Application.count();
    const decisionCount = await AIDecision.count();
    const candCount = await Candidate.count();
    const jobCount = await Job.count();

    console.log("📊 DATABASE STATUS:");
    console.log(`- Jobs: ${jobCount}`);
    console.log(`- Candidates: ${candCount}`);
    console.log(`- Applications: ${appCount}`);
    console.log(`- AI Decisions: ${decisionCount}`);

    if (decisionCount > 0) {
      const first = await AIDecision.findOne({ raw: true });
      console.log("\nSAMPLE AI DECISION:", first);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkCounts();
