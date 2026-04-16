/**
 * Database Seeding Script
 * Populates Jobs + Question Banks with Mask Polymers data
 * Run once during initial setup
 */

const { MARKETING_QUESTIONS } = require("./marketingQuestions.seeder");

async function seedDatabase() {
  try {
    // Wait for models to be available
    let retries = 0;
    let db;

    while (retries < 5) {
      try {
        db = require("../models");
        if (db && db.InterviewQuestionBank && db.Job) break;
      } catch (e) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!db || !db.InterviewQuestionBank) {
      console.warn("⚠️ Models not available. Skipping seeding.");
      return;
    }

    console.log("🌱 Starting Database Seeding...\n");

    // ======================================================
    // STEP 0: SEED JOBS
    // ======================================================
    console.log("💼 Checking Jobs...");

    const existingJobs = await db.Job.count();

    if (existingJobs === 0) {
      await db.Job.bulkCreate([
        {
          title: "Management Trainee - Marketing",
          department: "MARKETING",
          min_experience: 0,
          max_experience: 1,
          salary_min: 20000,
          salary_max: 30000,
          status: "ACTIVE"
        },
        {
          title: "Executive - Marketing",
          department: "MARKETING",
          min_experience: 1,
          max_experience: 3,
          salary_min: 30000,
          salary_max: 45000,
          status: "ACTIVE"
        },
        {
          title: "Assistant Manager - Marketing",
          department: "MARKETING",
          min_experience: 3,
          max_experience: 6,
          salary_min: 50000,
          salary_max: 70000,
          status: "ACTIVE"
        }
      ]);
      console.log("✅ Sample jobs seeded successfully\n");
    } else {
      console.log("✅ Jobs already exist. Skipping job seeding.\n");
    }

    // ======================================================
    // STEP 1: CHECK IF QUESTIONS ALREADY SEEDED
    // ======================================================
    const existingQuestions = await db.InterviewQuestionBank.findAll({
      limit: 1
    });

    if (existingQuestions.length > 0) {
      console.log("✅ Question bank already populated. Skipping question seeding.");
      return;
    }

    // ======================================================
    // STEP 2: SEED INTERVIEW QUESTIONS
    // ======================================================
    console.log("📚 Seeding Interview Questions...");

    const traineeQuestions = MARKETING_QUESTIONS.MANAGEMENT_TRAINEE;
    const executiveQuestions = MARKETING_QUESTIONS.EXECUTIVE_MARKETING;
    const amQuestions = MARKETING_QUESTIONS.ASSISTANT_MANAGER_MARKETING;

    for (const question of traineeQuestions) {
      await db.InterviewQuestionBank.create(question);
    }
    console.log(`✅ Seeded ${traineeQuestions.length} Management Trainee questions`);

    for (const question of executiveQuestions) {
      await db.InterviewQuestionBank.create(question);
    }
    console.log(`✅ Seeded ${executiveQuestions.length} Executive questions`);

    for (const question of amQuestions) {
      await db.InterviewQuestionBank.create(question);
    }
    console.log(`✅ Seeded ${amQuestions.length} Assistant Manager questions`);

    // ======================================================
    // STEP 3: SEED TECHNICAL QUESTIONS
    // ======================================================
    console.log("\n🔬 Seeding Technical Questions...");

    const technicalQuestions = [
      {
        questionId: "tech_mt_001",
        jobRole: "MANAGEMENT_TRAINEE_MARKETING",
        topic: "Polymer Fundamentals",
        difficulty: "EASY",
        questionType: "MCQ",
        question: "Which of the following is NOT a thermoplastic?",
        options: [
          "a) Polyethylene (PE)",
          "b) Polypropylene (PP)",
          "c) Epoxy Resin",
          "d) Polyvinyl Chloride (PVC)"
        ],
        correct_answer: "c) Epoxy Resin",
        explanation:
          "Epoxy is a thermoset (cross-linked network), cannot be remelted.",
        keywords: ["thermoset", "thermoplastic", "epoxy"],
        estimatedTime: 2,
        createdBy: "admin@maskpolymers.com"
      },
      {
        questionId: "tech_mt_002",
        jobRole: "MANAGEMENT_TRAINEE_MARKETING",
        topic: "Processing",
        difficulty: "MEDIUM",
        questionType: "THEORY",
        question:
          "Explain how the melt flow index (MFI) affects polymer processing.",
        expectedAnswer:
          "Higher MFI means lower viscosity and easier flow during processing.",
        keywords: ["MFI", "viscosity", "processing"],
        estimatedTime: 3,
        createdBy: "admin@maskpolymers.com"
      }
    ];

    for (const question of technicalQuestions) {
      await db.TechnicalQuestionBank.create(question);
    }

    console.log(`✅ Seeded ${technicalQuestions.length} Technical questions\n`);

    // ======================================================
    // SUMMARY
    // ======================================================
    console.log("🎉 Database seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(
      `  - Interview Questions: ${traineeQuestions.length +
      executiveQuestions.length +
      amQuestions.length
      }`
    );
    console.log(`  - Technical Questions: ${technicalQuestions.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

module.exports = seedDatabase;