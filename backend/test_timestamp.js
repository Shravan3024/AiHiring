const { sequelize, Application } = require("./src/models/index");
const { Op } = require("sequelize");

async function test() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log("Testing updated_at...");
  try {
    const count = await Application.count({
      where: {
        updated_at: { [Op.gte]: today }
      }
    });
    console.log("Count with updated_at:", count);
  } catch (err) {
    console.error("Error with updated_at:", err.message);
  }

  console.log("Testing updatedAt...");
  try {
    const count = await Application.count({
      where: {
        updatedAt: { [Op.gte]: today }
      }
    });
    console.log("Count with updatedAt:", count);
  } catch (err) {
    console.error("Error with updatedAt:", err.message);
  }
  process.exit(0);
}

test();
