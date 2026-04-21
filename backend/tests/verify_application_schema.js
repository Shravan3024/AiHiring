const { AssessmentAttempt, sequelize } = require("../src/models");

async function check() {
  try {
    const description = await AssessmentAttempt.describe();
    console.log("AssessmentAttempt Table Columns:", Object.keys(description));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
