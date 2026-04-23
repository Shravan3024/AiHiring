const { sequelize, OfferTemplate } = require('./src/models/index.js');

async function test() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    
    // Check if table exists
    const count = await OfferTemplate.count();
    console.log("Existing templates count:", count);

    const template = await OfferTemplate.create({
      templateName: "Test Template",
      templateContent: JSON.stringify({ subject: "Test", body: "Test body" }),
      createdBy: "1",
    });

    console.log("Created successfully:", template.templateId);
    
    // clean up
    await OfferTemplate.destroy({ where: { templateId: template.templateId } });
    console.log("Cleaned up");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    if (err.parent) console.error("Parent:", err.parent.message);
    process.exit(1);
  }
}

test();
