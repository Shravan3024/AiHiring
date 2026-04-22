const { Application } = require("./src/models/index");

async function test() {
  console.log("Fetching one application...");
  try {
    const app = await Application.findOne();
    if (app) {
      console.log("App properties:", Object.keys(app.toJSON()));
      console.log("updated_at:", app.updated_at);
      console.log("updatedAt:", app.updatedAt);
    } else {
      console.log("No application found.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}

test();
