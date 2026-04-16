const { Application, Candidate, AIDecision, ResumeAnalysis, AssessmentAnalysis, InterviewAnalysis, Job, Resume, sequelize } = require("./src/models");
const { v4: uuidv4 } = require("uuid");

async function seedAIData() {
  const transaction = await sequelize.transaction();
  try {
    const apps = await Application.findAll({ limit: 15, include: [Candidate, Job] });
    
    if (apps.length === 0) {
      console.log("No applications found to seed AI data.");
      return;
    }

    console.log(`Found ${apps.length} applications. Seeding AI analysis...`);

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      
      // Cleanup existing - ensure IDempotency
      await ResumeAnalysis.destroy({ where: { application_id: app.id }, transaction });
      await AssessmentAnalysis.destroy({ where: { application_id: app.id }, transaction });
      await InterviewAnalysis.destroy({ where: { application_id: app.id }, transaction });
      await AIDecision.destroy({ where: { application_id: app.id }, transaction });

      // 0. Create Dummy Resume
      const resume = await Resume.create({
        application_id: app.id,
        candidate_id: app.candidate_id,
        file_path: `uploads/resumes/dummy_${app.id}.pdf`,
        file_type: "pdf",
        status: "PARSED"
      }, { transaction });

      let ai_decision = "PROCEED_TO_HR";
      let app_status = "PROCEED_TO_HR";
      let score = 50 + Math.floor(Math.random() * 20); // 50-70
      
      if (i < 5) {
        ai_decision = "RECOMMENDED";
        app_status = "RECOMMENDED_BY_AI";
        score = 75 + Math.floor(Math.random() * 20); // 75-95
      } else if (i >= 10) {
        ai_decision = "AUTO_REJECTED";
        app_status = "AUTO_REJECTED";
        score = 10 + Math.floor(Math.random() * 25); // 10-35
      }

      // 1. Create Resume Analysis
      await ResumeAnalysis.create({
        application_id: app.id,
        resume_id: resume.id,
        overall_score: score - 5,
        jd_match_score: score - 2,
        contact_info: { name: app.Candidate?.name, email: app.Candidate?.email },
        education: [{ degree: "B.Tech", specialization: "Mechanical", year_of_passout: 2020 }],
        experience: [{ position: "Engineer", company: "Industrial Corp", duration_years: 3 }],
        skills: { technical: ["Polymer", "Heat treatment"], tools: ["SolidWorks"] },
        ai_summary: "Strong mechanical background with experience in polymer processing. Demonstrates leadership in previous roles.",
        strengths: ["Domain expertise", "Process knowledge", "Communication"],
        weaknesses: ["Niche tool specialization"],
        total_years_experience: 4,
        ai_model_used: "gemini-2.5-flash"
      }, { transaction });

      // 2. Create Assessment Analysis
      await AssessmentAnalysis.create({
        application_id: app.id,
        assessment_type: "coding",
        test_name: "Core Technical Assessment",
        overall_score: score + 2,
        correctness_score: score + 5,
        code_quality_score: 80,
        efficiency_score: 85,
        strengths: ["Logical thinking", "Syntax precision"],
        estimated_skill_level: i < 5 ? "senior" : (i >= 10 ? "junior" : "mid_level"),
        ai_model_used: "gemini-2.5-flash"
      }, { transaction });

      // 3. Create Interview Analysis
      await InterviewAnalysis.create({
        application_id: app.id,
        interview_type: "technical",
        overall_score: score,
        technical_knowledge_score: score,
        communication_score: 85,
        hire_recommendation: i < 5 ? "strong_yes" : (i >= 10 ? "no" : "maybe"),
        green_flags: ["Articulate", "Fast learner"],
        red_flags: i >= 10 ? ["Inconsistent answers"] : [],
        ai_model_used: "gemini-2.5-flash"
      }, { transaction });

      // 4. Create AI Decision
      await AIDecision.create({
        application_id: app.id,
        candidate_id: app.candidate_id,
        job_id: app.job_id,
        resume_score: score - 5,
        technical_assessment_score: score + 2,
        interview_score: score,
        final_score: score,
        ai_decision: ai_decision,
        decision_reason: `Automated seeding: Candidate demonstrates ${ai_decision.toLowerCase()} profile base.`,
        confidence_percentage: 85 + Math.random() * 10,
        summary: `Seeded executive summary for ${app.Candidate?.name || "Candidate"}.`,
        ai_model_used: "gemini-2.5-flash"
      }, { transaction });

      // 5. Update Application
      await Application.update({ 
        status: app_status,
        overall_score: score,
        resume_score: score - 5,
        technical_score: score + 2,
        interview_score: score
      }, { where: { id: app.id }, transaction });
    }

    await transaction.commit();
    console.log("✅ Successfully seeded 15 applications with complete AI analysis pipelines!");
    process.exit(0);
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("Error seeding AI data:", err);
    process.exit(1);
  }
}

seedAIData();
