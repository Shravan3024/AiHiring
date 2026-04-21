const { sequelize } = require("./src/models");

async function deepAudit() {
  const models = sequelize.models;
  const analysis = [];

  for (const modelName in models) {
    const model = models[modelName];
    const table = model.tableName;
    
    try {
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = '${table}'
      `);
      const cols = columns.map(c => c.column_name);
      
      const has_snake_c = cols.includes('created_at');
      const has_camel_c = cols.includes('createdAt');
      const has_snake_u = cols.includes('updated_at');
      const has_camel_u = cols.includes('updatedAt');

      // Check model mapping
      const mapped_c = model.options.createdAt;
      const mapped_u = model.options.updatedAt;

      analysis.push({
        model: modelName,
        table: table,
        columns: { created_at: has_snake_c, createdAt: has_camel_c, updated_at: has_snake_u, updatedAt: has_camel_u },
        mapping: { createdAt: mapped_c, updatedAt: mapped_u }
      });
    } catch (e) {
      // Skip if table doesn't exist
    }
  }

  console.log("--- TIMESTAMP COLUMN AUDIT ---");
  analysis.forEach(a => {
    if (a.columns.created_at && a.columns.createdAt) {
      console.log(`\nConflict in Table: ${a.table} (Model: ${a.model})`);
      console.log(`  Columns present: created_at AND createdAt`);
      console.log(`  Model Mapping: createdAt -> ${a.mapping.createdAt || 'DEFAULT (createdAt)'}`);
      
      if (a.mapping.createdAt === 'created_at') {
        console.log(`  Recommendation: SAFE TO DROP 'createdAt' from DB.`);
      } else {
        console.log(`  Recommendation: Model is NOT mapped. Drop with caution or update model first.`);
      }
    }
  });

  process.exit(0);
}

deepAudit();
