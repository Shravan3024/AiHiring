const { User, Candidate, Job, Application, sequelize } = require("../src/models");
const jwt = require("jsonwebtoken");

async function setup() {
  try {
    await sequelize.authenticate();
    console.log("DB Connected.");

    // 1. Create Test Candidate User
    const [user] = await User.findOrCreate({
      where: { email: "validator_candidate@test.com" },
      defaults: {
        name: "Validator Candidate",
        role: "CANDIDATE",
        password: "password123",
      }
    });

    const [candidate] = await Candidate.findOrCreate({
      where: { user_id: user.id },
      defaults: {
        education: "B.Tech",
        specialization: "Computer Science",
        experience_years: 5
      }
    });

    // 2. Create Test Job
    const [job] = await Job.findOrCreate({
      where: { title: "Executive - Marketing" },
      defaults: {
        department: "Marketing",
        min_experience: 1,
        max_experience: 5,
        salary_min: 50000,
        salary_max: 90000,
        description: "Looking for a results-oriented Marketing Executive.",
        required_skills: ["Marketing", "SEO", "Sales"],
        status: "ACTIVE"
      }
    });

    // 3. Create Application
    const [application] = await Application.findOrCreate({
      where: { candidate_id: candidate.id, job_id: job.id },
      defaults: {
        id: 9999,
        status: "APPLIED"
      }
    });

    // 4. Generate Tokens
    const candidateToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, "supersecret123", { expiresIn: "1h" });

    const [hrUser] = await User.findOrCreate({
      where: { email: "hr@test.com" },
      defaults: {
        name: "HR Manager",
        role: "HR",
        password: "password123"
      }
    });
    const hrToken = jwt.sign({ id: hrUser.id, email: hrUser.email, role: hrUser.role }, "supersecret123", { expiresIn: "1h" });

    // 5. Create Session for Candidate
    const { CandidateSession } = require("../src/models");
    await CandidateSession.create({
      candidate_id: candidate.id,
      session_token: candidateToken,
      ip_address: "127.0.0.1",
      user_agent: "Validation Test Script",
      is_active: true,
      last_activity_at: new Date()
    });

    console.log("Setup Complete.");
    console.log("CANDIDATE_TOKEN:", candidateToken);
    console.log("HR_TOKEN:", hrToken);
    console.log("APPLICATION_ID:", application.id);
    
    process.exit(0);
  } catch (err) {
    console.error("Setup Failed:", err);
    process.exit(1);
  }
}

setup();
