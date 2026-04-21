const { sequelize } = require("./src/models");

async function diagnoseDatabase() {
  try {
    console.log("--- SCANNING DATABASE TABLES ---");
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    const dbTables = tables.map(t => t.table_name);
    console.log("Tables in DB:", dbTables);

    console.log("\n--- SCANNING SEQUELIZE MODELS ---");
    const models = sequelize.models;
    const modelReports = [];
    for (const modelName in models) {
      modelReports.push({
        model: modelName,
        table: models[modelName].tableName
      });
    }
    console.log("Models defined in Sequelize:", modelReports);

    console.log("\n--- IDENTIFYING POTENTIAL REDUNDANCIES ---");
    
    // Group tables by name (case-insensitive and plural/singular)
    const grouped = {};
    dbTables.forEach(t => {
      const normalized = t.toLowerCase().replace(/s$/, ''); // Very basic normalization
      if (!grouped[normalized]) grouped[normalized] = [];
      grouped[normalized].push(t);
    });

    console.log("Grouped potential duplicates:");
    for (const key in grouped) {
      if (grouped[key].length > 1) {
        console.log(`- Potential duplicates for '${key}': ${grouped[key].join(", ")}`);
      }
    }

    // Check for tables in DB but NOT in models
    const modelTables = modelReports.map(m => m.table);
    const unmappedTables = dbTables.filter(t => !modelTables.includes(t));
    
    if (unmappedTables.length > 0) {
      console.log("\nTables in DB that are NOT mapped to any active Sequelize model:");
      unmappedTables.forEach(t => console.log(`- ${t}`));
    }

    process.exit(0);
  } catch (error) {
    console.error("Diagnosis failed:", error);
    process.exit(1);
  }
}

diagnoseDatabase();
