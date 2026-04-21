const { sequelize } = require("./src/models");

async function findDuplicateColumns() {
  try {
    console.log("--- SCANNING FOR COLUMN CONFLICTS/DUPLICATES ---");
    
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    const tableNames = tables.map(t => t.table_name);
    const conflicts = [];

    for (const table of tableNames) {
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${table}'
      `);

      const colNames = columns.map(c => c.column_name);
      
      // Look for similar names (e.g. userId vs user_id, createdAt vs created_at, ID vs id)
      const normalized = {};
      for (const col of colNames) {
        // Normalize: lowercase and remove underscores
        const key = col.toLowerCase().replace(/_/g, '');
        if (!normalized[key]) normalized[key] = [];
        normalized[key].push(col);
      }

      for (const key in normalized) {
        if (normalized[key].length > 1) {
          conflicts.push({
            table: table,
            group: key,
            columns: normalized[key]
          });
        }
      }
    }

    if (conflicts.length === 0) {
      console.log("No duplicate or conflicting columns found.");
    } else {
      console.log("\nPotential Column Conflicts Detected:");
      conflicts.forEach(c => {
        console.log(`Table: ${c.table}`);
        console.log(`  Normalized Group: ${c.group}`);
        console.log(`  Columns Found: ${c.columns.join(", ")}`);
        
        // Check row counts of non-null values for each to see which is more "active"
        // (This would be slow for all, but good for reporting)
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("Column scan failed:", error);
    process.exit(1);
  }
}

findDuplicateColumns();
