/**
 * Database Seeding Script
 * Populates Jobs, Question Banks, and Approval Rules with Mask Polymers data
 */

const { MARKETING_QUESTIONS } = require("./marketingQuestions.seeder");

async function seedDatabase() {
  try {
    let db;
    try {
      db = require("../models");
    } catch (e) {
      console.warn("⚠️ Models not available. Skipping seeding.");
      return;
    }

    if (!db || !db.Job) {
      console.warn("⚠️ Models not fully loaded. Skipping seeding.");
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
        { title: "Management Trainee - Marketing", department: "MARKETING", min_experience: 0, max_experience: 1, salary_min: 20000, salary_max: 30000, status: "ACTIVE" },
        { title: "Executive - Marketing", department: "MARKETING", min_experience: 1, max_experience: 3, salary_min: 30000, salary_max: 45000, status: "ACTIVE" },
        { title: "Assistant Manager - Marketing", department: "MARKETING", min_experience: 3, max_experience: 6, salary_min: 50000, salary_max: 70000, status: "ACTIVE" }
      ]);
      console.log("✅ Sample jobs seeded successfully\n");
    } else {
      console.log("✅ Jobs already exist. Skipping job seeding.\n");
    }

    // ======================================================
    // STEP 1: SEED INTERVIEW QUESTIONS
    // ======================================================
    console.log("📚 Checking Interview Questions...");
    const existingQuestions = await db.InterviewQuestionBank.count();
    if (existingQuestions === 0) {
      const traineeQuestions = MARKETING_QUESTIONS.MANAGEMENT_TRAINEE;
      const executiveQuestions = MARKETING_QUESTIONS.EXECUTIVE_MARKETING;
      const amQuestions = MARKETING_QUESTIONS.ASSISTANT_MANAGER_MARKETING;

      for (const question of traineeQuestions) await db.InterviewQuestionBank.create(question);
      for (const question of executiveQuestions) await db.InterviewQuestionBank.create(question);
      for (const question of amQuestions) await db.InterviewQuestionBank.create(question);
      console.log("✅ Interview questions seeded successfully\n");
    } else {
      console.log("✅ Question bank already populated. Skipping interview questions.\n");
    }

    // ======================================================
    // STEP 2: SEED TECHNICAL QUESTIONS
    // ======================================================
    console.log("🔬 Checking Technical Questions...");
    const existingTech = await db.TechnicalQuestionBank.count();
    if (existingTech === 0) {
      const technicalQuestions = [
        {
          questionId: "tech_mt_001", jobRole: "MANAGEMENT_TRAINEE_MARKETING", topic: "Polymer Fundamentals", difficulty: "EASY", questionType: "MCQ",
          question: "Which of the following is NOT a thermoplastic?",
          options: ["a) Polyethylene (PE)", "b) Polypropylene (PP)", "c) Epoxy Resin", "d) Polyvinyl Chloride (PVC)"],
          correct_answer: "c) Epoxy Resin", explanation: "Epoxy is a thermoset (cross-linked network), cannot be remelted.",
          keywords: ["thermoset", "thermoplastic", "epoxy"], estimatedTime: 2, createdBy: "admin@maskpolymers.com"
        }
      ];
      for (const question of technicalQuestions) await db.TechnicalQuestionBank.create(question);
      console.log("✅ Technical questions seeded successfully\n");
    } else {
      console.log("✅ Technical questions already exist.\n");
    }

    // ======================================================
    // STEP 3: SEED HR APPROVAL RULES
    // ======================================================
    console.log("🔐 Checking HR Approval Rules...");
    const existingRules = await db.HRApprovalRule.count();
    if (existingRules === 0) {
      await db.HRApprovalRule.bulkCreate([
        { ruleId: "RULE_RESUME", stage: "RESUME", approvalsRequired: 1, description: "Single HR review for initial resume screening" },
        { ruleId: "RULE_TECHNICAL", stage: "TECHNICAL", approvalsRequired: 1, description: "Technical assessment approval threshold" },
        { ruleId: "RULE_INTERVIEW", stage: "INTERVIEW", approvalsRequired: 1, description: "AI Interview performance validation" },
        { ruleId: "RULE_FINAL", stage: "FINAL", approvalsRequired: 3, description: "Multi-HR concurrence required for candidate selection" }
      ]);
      console.log("✅ HR Approval Rules seeded successfully\n");
    } else {
      console.log("✅ HR Approval Rules already exist.\n");
    }

    console.log("🎉 Database seeding step finished!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

module.exports = seedDatabase;