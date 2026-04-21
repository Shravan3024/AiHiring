const { sequelize } = require("./src/models");

async function checkCounts() {
  const tables = ["Applications", "applications", "mcq_answers", "MCQAnswers", "MCQTests"];
  for (const t of tables) {
    try {
      const [results] = await sequelize.query(`SELECT count(*) FROM "${t}"`);
      console.log(`${t}: ${results[0].count}`);
    } catch (e) {
      console.log(`${t}: Table missing or error: ${e.message}`);
    }
  }
  process.exit(0);
}

checkCounts();
