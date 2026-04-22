const models = require("./src/models/index");

async function testModels() {
  for (const [name, model] of Object.entries(models)) {
    if (name === 'sequelize') continue;
    console.log(`Testing model: ${name}...`);
    try {
      await model.findOne();
      console.log(`  OK: ${name}`);
    } catch (err) {
      console.error(`  FAIL: ${name} - ${err.message}`);
    }
  }
  process.exit(0);
}

testModels();
