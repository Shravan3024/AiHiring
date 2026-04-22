const { sequelize } = require("./src/models/index");

async function listTables() {
  try {
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Raw results:", results);
    process.exit(0);
  } catch (error) {
    console.error("Error listing tables:", error);
    process.exit(1);
  }
}

listTables();
