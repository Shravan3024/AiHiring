const { Application, InterviewSession } = require("./src/models");

async function syncInterviews() {
  try {
    const sessions = await InterviewSession.findAll({
      where: { status: 'COMPLETED' },
      include: [Application]
    });

    for (const session of sessions) {
      if (session.Application) {
        if (session.Application.status === 'INTERVIEW_IN_PROGRESS' || session.Application.interview_score === 0) {
          console.log(`Updating Application ${session.application_id} with score ${session.overall_score}`);
          await session.Application.update({
            status: 'INTERVIEW_COMPLETED',
            interview_score: session.overall_score || 0
          });
        }
      }
    }
    console.log("Sync complete");
  } catch (e) {
    console.error("Error syncing:", e);
  }
}

syncInterviews();
