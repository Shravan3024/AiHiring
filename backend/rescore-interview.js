const { Application, InterviewSession } = require("./src/models");
const aiService = require("./src/services/ai.service");

async function rescore() {
  try {
    const session = await InterviewSession.findOne({
      where: { application_id: 59 },
      include: [Application]
    });

    if (session && session.questions_asked) {
      console.log("Found session, running AI analysis...");
      const qaPairs = session.questions_asked.map(q => ({
        question: q.question_text || q.question,
        answer: q.response_text || "",
        duration: q.response_duration_seconds || 60
      }));

      const aiAnalysis = await aiService.analyzeFullInterview(qaPairs, session.Application?.Job?.title);
      const score = aiAnalysis.overall_interview_score || 0;
      
      console.log("AI Score calculated:", score);

      await session.update({
        overall_score: score,
        dimension_scores: aiAnalysis.dimension_scores,
        highlights: aiAnalysis.highlights,
        hire_recommendation: aiAnalysis.recommendation?.toUpperCase().replace(/\s+/g, '_') || 'MAYBE'
      });

      if (session.Application) {
        await session.Application.update({
          interview_score: Math.round(score),
          status: 'INTERVIEW_COMPLETED'
        });
        console.log("Application updated!");
      }
    } else {
      console.log("No session or questions found");
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

rescore();
