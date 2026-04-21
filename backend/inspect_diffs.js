const { sequelize } = require("./src/models");

async function inspect() {
  const [rows] = await sequelize.query(`SELECT "created_at", "createdAt" FROM "NotificationQueues" WHERE "created_at" != "createdAt" LIMIT 5`);
  console.table(rows);
  process.exit(0);
}

inspect();
