const { ManualJobMapping, Job } = require('../models');

async function seedManualMappings() {
  try {
    const jobs = await Job.findAll();
    
    if (jobs.length === 0) {
      console.log("No jobs found to create manual mappings.");
      return;
    }

    console.log(`Seeding manual mappings for ${jobs.length} roles...`);

    for (const job of jobs) {
      // Basic heuristic based on job title
      const title = job.title.toLowerCase();
      
      let requiredSkills = ["Communication", "Problem Solving"];
      let education = ["B.Tech", "BE", "MCA"];
      let minExp = 2;

      if (title.includes("software") || title.includes("developer")) {
        requiredSkills = ["JavaScript", "Node.js", "React", "SQL"];
      } else if (title.includes("polymer") || title.includes("chemical")) {
        requiredSkills = ["Polymer Chemistry", "Material Science", "Process Control"];
      } else if (title.includes("manager") || title.includes("lead")) {
        requiredSkills = ["Management", "Leadership", "Strategy"];
        minExp = 5;
      }

      await ManualJobMapping.upsert({
        jobId: job.id,
        jobRole: job.title,
        requiredSkills: requiredSkills,
        preferredSkills: ["Agile", "Teamwork"],
        requiredEducation: education,
        minExperience: minExp,
        mappingKeywords: {
          "technical": ["expert", "knowledge", "design", "development"],
          "soft": ["articulate", "confident", "clarity"]
        }
      });
    }

    console.log("✅ Manual Job Mappings seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding manual mappings:", error);
  }
}

module.exports = seedManualMappings;
