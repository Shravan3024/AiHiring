const { sequelize } = require("./src/models");

async function checkModels() {
  const models = sequelize.models;
  const reports = [];

  for (const modelName in models) {
    const model = models[modelName];
    try {
      const description = await model.describe();
      const columns = Object.keys(description);
      reports.push({
        model: modelName,
        table: model.tableName,
        columnCount: columns.length,
        columns: columns
      });
    } catch (error) {
      reports.push({
        model: modelName,
        error: error.message
      });
    }
  }

  console.log(JSON.stringify(reports, null, 2));
  process.exit(0);
}

checkModels();
