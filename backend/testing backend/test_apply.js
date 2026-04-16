const { Job, Candidate, Application } = require("../src/models");
const sequelize = require("../src/config/db");

async function applyTest() {
  try {
    const candidate = await Candidate.findOne();
    if (!candidate) {
      console.log("No candidate found.");
      return;
    }

    let job = await Job.findOne();
    if (!job) {
      console.log("No jobs exist. Creating a test job...");
      job = await Job.create({
        title: "Frontend Developer",
        department: "Engineering",
        location: "Remote",
        type: "Full-time",
        experience_level: "Mid",
        salary: "$100k-$130k",
        description: "Test job",
        requirements: "React",
        status: "OPEN"
      });
    }

    console.log(`Candidate ${candidate.id} applying for Job ${job.id}...`);

    await Application.findOrCreate({
      where: { candidate_id: candidate.id, job_id: job.id },
      defaults: {
        status: "APPLIED",
        education: candidate.education,
        specialization: candidate.specialization,
        experience_years: candidate.experience_years,
        resume_url: candidate.resume_path,
        skills: candidate.skills,
        cgpa: candidate.cgpa,
        year_of_passout: candidate.year_of_passout
      }
    });

    console.log("Successfully created application!");
    const hrApps = await Application.findAll();
    console.log(`Total applications in DB: ${hrApps.length}`);
    process.exit(0);

  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
applyTest();
