const { getDashboardStats } = require("./src/controllers/admin.dashboard.controller");

const req = {};
const res = {
  status: function(s) { this.statusCode = s; return this; },
  json: function(j) { console.log("Response:", JSON.stringify(j, null, 2)); }
};

async function test() {
  console.log("Starting test...");
  try {
    await getDashboardStats(req, res);
  } catch (err) {
    console.error("Direct call error:", err);
  }
}

test();
