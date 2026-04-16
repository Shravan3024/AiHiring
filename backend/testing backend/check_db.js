require("dotenv").config();
const sequelize = require("../src/config/db");

async function check() {
  try {
    const [rows] = await sequelize.query(
      `SELECT c.id, c.user_id, u.name, u.email, c.resume_path, c.skills, c.cgpa, c.year_of_passout
       FROM "Candidates" c 
       JOIN "Users" u ON u.id = c.user_id
       ORDER BY c.id`
    );
    console.log("\n=== All Candidates with resume data ===");
    rows.forEach(r => {
      console.log(`  ID=${r.id} | ${r.name} (${r.email})`);
      console.log(`    resume_path: ${r.resume_path || 'NULL'}`);
      console.log(`    skills: ${JSON.stringify(r.skills)}`);
      console.log(`    cgpa: ${r.cgpa || 'NULL'}`);
      console.log(`    year_of_passout: ${r.year_of_passout || 'NULL'}`);
      console.log('');
    });

    const [apps] = await sequelize.query(
      `SELECT a.id, a.candidate_id, a.status, a.resume_url, a.skills, a.cgpa, a.year_of_passout
       FROM "Applications" a ORDER BY a.id`
    );
    console.log("=== All Applications with resume data ===");
    apps.forEach(r => {
      console.log(`  App ID=${r.id} | candidate_id=${r.candidate_id} | status=${r.status}`);
      console.log(`    resume_url: ${r.resume_url || 'NULL'}`);
      console.log(`    skills: ${JSON.stringify(r.skills)}`);
      console.log(`    cgpa: ${r.cgpa || 'NULL'}`);
      console.log(`    year_of_passout: ${r.year_of_passout || 'NULL'}`);
      console.log('');
    });

    process.exit(0);
  } catch (e) {
    console.error("ERROR:", e.message);
    process.exit(1);
  }
}
check();
