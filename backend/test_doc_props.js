const { DocumentRecord } = require("./src/models/index");

async function test() {
  console.log("Fetching one DocumentRecord...");
  try {
    const doc = await DocumentRecord.findOne();
    if (doc) {
      console.log("Doc properties:", Object.keys(doc.toJSON()));
      console.log("updated_at:", doc.updated_at);
      console.log("updatedAt:", doc.updatedAt);
    } else {
      console.log("No DocumentRecord found.");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}

test();
