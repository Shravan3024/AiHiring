require("dotenv").config();
const sequelize = require("./src/config/db");
const fs = require("fs");

async function check() {
  try {
    const [c] = await sequelize.query(`SELECT id, user_id, resume_path, skills, cgpa, year_of_passout FROM "Candidates" ORDER BY id DESC LIMIT 5`);
    const [a] = await sequelize.query(`SELECT id, candidate_id, resume_url, skills, cgpa, year_of_passout FROM "Applications" ORDER BY id DESC LIMIT 5`);

    fs.writeFileSync("db_dump.json", JSON.stringify({ candidates: c, applications: a }, null, 2));
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
