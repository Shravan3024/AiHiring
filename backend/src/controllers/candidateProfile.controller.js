const {
  Application, Candidate, User,
  TechnicalRound, Interview,
  MalpracticeEvent, Offer, Job, HRInternalNote,
  ResumeAnalysis, AssessmentAnalysis, InterviewAnalysis,
  ApplicationStatusLog
} = require('../models');
const { Op } = require('sequelize');
const { STATUS_GROUPS, computeApplicationScore, getFitBand } = require('../utils/applicationStatus.utils');

// ── EXACT enum values from your DB (verified via pg_enum query) ───
const ALL_STATUSES = [
  'APPLIED',
  'RESUME_SUBMITTED',
  'RESUME_EVALUATED',
  'TECHNICAL_ROUND_PENDING',
  'TECHNICAL_ROUND_IN_PROGRESS',
  'TECHNICAL_ROUND_COMPLETED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_IN_PROGRESS',
  'INTERVIEW_COMPLETED',
  'HR_REVIEW',
  'SELECTED',
  'REJECTED',
];

class CandidateProfileController {

  /**
   * GET /hr/candidate/:applicationId
   */
  static async getCandidateProfile(req, res) {
    try {
      const { applicationId } = req.params;

      if (!applicationId || applicationId === 'undefined' || applicationId === 'null') {
        return res.status(400).json({
          success: false,
          message: 'applicationId is missing. Check that useParams() key matches :applicationId in your route.'
        });
      }

    const application = await Application.findByPk(applicationId, {
      attributes: [
        'id', 'candidate_id', 'job_id', 'status', 'resume_score', 
        'technical_score', 'interview_score', 'overall_score', 'hr_decision', 
          'hr_notes', 'summary', 'applied_at', 'created_at', 'updated_at',
          'experience_years', 'skills', 'cgpa', 'year_of_passout'
        ],
        include: [
          { 
            model: Candidate, 
            attributes: ['id', 'user_id', 'phone', 'location', 'education', 'specialization', 'skills', 'cgpa', 'year_of_passout', 'summary', 'ai_summary', 'integrity_score', 'resume_path', 'profile_image_path'],
            include: [{ model: User, attributes: ['id', 'name', 'email'] }] 
          },
          { model: TechnicalRound, required: false, attributes: ['id', 'score', 'status', 'ai_feedback'] },
          { model: Interview,      required: false, attributes: ['id', 'ai_score', 'ai_summary', 'hire_recommendation', 'status'] },
          { model: Offer,          required: false, attributes: ['id', 'salary', 'joining_date', 'status'] },
          { model: ResumeAnalysis, required: false, attributes: ['id', 'strengths', 'weaknesses', 'why_to_hire', 'ai_model_used', 'overall_score', 'ai_summary'] },
          { model: AssessmentAnalysis, required: false, attributes: ['id', 'strengths', 'weaknesses', 'ai_model_used', 'overall_score'] },
          { model: InterviewAnalysis, required: false, attributes: ['id', 'strengths', 'weaknesses', 'ai_model_used', 'overall_score', 'qa_pairs', 'detailed_evaluation', 'interview_session_id'] },
          { model: Job,           required: false, attributes: ['id', 'title', 'department'] },
          { 
            model: require('../models').InterviewSession, 
            required: false, 
            attributes: ['id', 'recording_path', 'answers_provided', 'ai_analysis'] 
          },
          {
            model: require('../models').MalpracticeEvent,
            required: false,
            attributes: ['id', 'type', 'severity', 'created_at']
          }
        ]
      });

      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const user      = application.Candidate?.User;
      const technical = application.TechnicalRound;
      const interview = application.Interview;

      const resumeScore    = application.ResumeAnalysis?.overall_score || application.resume_score || 0;
      const technicalScore = technical?.score || application.AssessmentAnalysis?.overall_score || application.technical_score || 0;
      const interviewScore = interview?.ai_score || application.InterviewAnalysis?.overall_score || application.interview_score || 0;

      const aggregateScore = computeApplicationScore({
        overallScore: application.overall_score,
        resumeScore,
        technicalScore,
        interviewScore,
        malpracticeWarnings: application.malpractice_warnings || 0
      });

      const fitBand = getFitBand(aggregateScore);
      const aiFitBand = fitBand === 'high_fit' ? 'GOOD'
        : fitBand === 'avg_fit' ? 'AVERAGE'
        : 'WEAK';

      let malpractice = [];
      let notes = [];
      try {
        malpractice = await MalpracticeEvent.findAll({
          where: { application_id: applicationId },
          order: [['created_at', 'DESC']], limit: 20
        });
      } catch (_) {}

      try {
         notes = await HRInternalNote.findAll({
            where: { applicationId },
            order: [['created_at', 'DESC']],
            include: [{ model: User, as: 'author', attributes: ['name', 'role'] }]
         });
      } catch (_) {}

      return res.status(200).json({
        success: true,
        data: {
          id:               application.id,
          _id:              String(application.id),
          candidate: {
            id:             application.candidate_id,
            name:           user?.name  || 'N/A',
            email:          user?.email || 'N/A',
            phone:          application.Candidate?.phone || null,
            location:       application.Candidate?.location || null,
            education:      application.Candidate?.education || null,
            specialization: application.Candidate?.specialization || null,
            experience:     application.experience_years || 0,
            skills:         application.Candidate?.skills || application.skills || [],
            cgpa:           application.Candidate?.cgpa || application.cgpa || null,
            year_of_passout: application.Candidate?.year_of_passout || application.year_of_passout || null,
            summary:         application.summary || application.Candidate?.summary || null,
            aiSummary:       application.Candidate?.ai_summary || null,
          },
          job: {
            id:             application.job_id,
            title:          application.Job?.title || 'N/A',
            department:     application.Job?.department || 'N/A',
          },
          status:           application.status,
          stage:            application.status,
          appliedAt:        application.applied_at || application.createdAt,
          resumeUrl:        application.Candidate?.resume_path ? `http://localhost:5000${application.Candidate.resume_path}` : null,
          aiScore:          aggregateScore,
          aiFitBand,
          integrityScore:   application.Candidate?.integrity_score || 100,

          scores: {
            resume: resumeScore,
            technical: technicalScore, interview: interviewScore,
            aggregate: aggregateScore,
          },

          evaluationProsCons: buildProsCons(
            { resumeScore, technicalScore, interviewScore, malpracticeScore: malpractice.length || 0 }, 
            { 
              resumeAnalysis: application.ResumeAnalysis, 
              assessmentAnalysis: application.AssessmentAnalysis, 
              interviewAnalysis: application.InterviewAnalysis,
              interview
            }
          ),

          whyToHire: application.ResumeAnalysis?.why_to_hire || null,

          technicalData: technical ? { id: technical.id, score: technical.score, status: technical.status, feedback: technical.ai_feedback } : null,
          interviewData: interview ? { score: interview.ai_score, summary: interview.ai_summary, recommendation: interview.hire_recommendation, status: interview.status } : null,
          interviewAnalysis: application.InterviewAnalysis ? {
            id: application.InterviewAnalysis.id,
            overall_score: application.InterviewAnalysis.overall_score,
            strengths: application.InterviewAnalysis.strengths,
            weaknesses: application.InterviewAnalysis.weaknesses,
            qa_pairs: application.InterviewAnalysis.qa_pairs,
            detailed_evaluation: application.InterviewAnalysis.detailed_evaluation,
            ai_model_used: application.InterviewAnalysis.ai_model_used
          } : null,
          offerData: application.Offer ? { salary: application.Offer.salary, joiningDate: application.Offer.joining_date, status: application.Offer.status } : null,
          
          interviewHighlights: application.InterviewSession ? (() => {
            const firstWithVideo = (application.InterviewSession.questions_asked || []).find(q => q.recording_path);
            const recordingBase = application.InterviewSession.recording_path || firstWithVideo?.recording_path;
            return {
              videoUrl: recordingBase ? `http://localhost:5000${recordingBase}` : null,
              highlights: (application.InterviewSession.questions_asked || []).map((ans, idx) => ({
                question: ans.question_text || ans.question || `Question ${idx + 1}`,
                timestamp: ans.answered_at ? new Date(ans.answered_at).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }) : '00:00',
                duration: ans.response_duration_seconds || 45,
                score: ans.analysis?.relevance ? Math.round(ans.analysis.relevance * 100) : 0,
                confidence: ans.analysis?.confidence ? (ans.analysis.confidence > 0.7 ? 'High' : 'Medium') : 'N/A'
              }))
            };
          })() : null,

          // FIX: Integrity Risk - uses malpractice fetched above with correct field names
          proctoringSummary: {
            integrityScore: Math.max(0, 100 - (malpractice.length * 10)),
            malpracticeWarnings: malpractice.length,
            violations: malpractice.map(e => ({
              type: e.type,
              severity: e.severity || 1,
              createdAt: e.created_at,
              meta: e.meta || {}
            }))
          },

          malpracticeEvents: malpractice.map(e => ({ type: e.event_type || e.type, severity: e.severity, timestamp: e.created_at })),
          internalNotes: notes.map(n => ({
            id: n.id, content: n.content, type: n.noteType,
            author: n.author?.name || 'System', version: n.version,
            created_at: n.created_at
          })),
          approvals: {
            totalNeeded: 1,
            received: ['RECOMMENDED_BY_AI', 'SELECTED', 'OFFERED'].includes(application.status) ? 1 : 0,
            records: application.hr_decision ? [{
              reviewer: 'HR', decision: application.hr_decision,
              reason: application.hr_notes, timestamp: application.updated_at, order: 1,
            }] : [],
          },
          // FIX: Evaluation Traces - use ApplicationStatusLog (actual audit trail) with proper comments column
          auditLogs: {
            statusLogs: await ApplicationStatusLog.findAll({
              where: { application_id: applicationId },
              order: [['created_at', 'DESC']],
              limit: 50
            }),
            approvalRecords: await ApplicationStatusLog.findAll({
              where: { application_id: applicationId },
              order: [['created_at', 'DESC']],
              limit: 50
            }).then(logs => logs.map(log => ({
              decision: log.new_status,
              approvalStage: log.previous_status || 'INITIAL',
              comments: log.reason || log.metadata?.reason || `Status changed to ${log.new_status}`,
              reviewer: { name: log.changed_by === 'SYSTEM_AUTO_REJECTION' ? 'System AI' : (log.changed_by ? `User #${log.changed_by}` : 'HR System') },
              timestamp: log.created_at
            })))
          }
        }
      });

    } catch (error) {
      console.error('Error fetching candidate profile:', error);
      return res.status(500).json({ success: false, message: 'Error fetching candidate profile' });
    }
  }

  /**
   * GET /hr/pipeline
   */
  static async getPipelineCandidates(req, res) {
    try {
      const { fitBand, search, role, stage, minSkillMatch, sortByFitBand } = req.query;

        const applications = await Application.findAll({
          where: { status: { [Op.in]: STATUS_GROUPS.pipeline } },
          attributes: ['id', 'candidate_id', 'job_id', 'status', 'resume_score', 'technical_score', 'interview_score', 'overall_score', 'updated_at'],
          include: [
            { 
              model: Candidate, 
              attributes: ['id', 'user_id', 'integrity_score'],
              include: [{ model: User, attributes: ['id', 'name', 'email'] }] 
            },
            { model: TechnicalRound, required: false, attributes: ['id', 'score'] },
            { model: Interview,      required: false, attributes: ['id', 'ai_score'] },
            { model: MalpracticeEvent, required: false, attributes: ['id'] },
            { model: Job, required: false, attributes: ['id', 'title'] }
          ],
          order: [['created_at', 'ASC']]
        });

        let candidates = applications.map(app => {
          const user        = app.Candidate?.User;
          const resumeScore = app.resume_score                         || 0;
          const techScore   = app.TechnicalRound?.score || app.technical_score || 0;
          const intScore    = app.Interview?.ai_score   || app.interview_score || 0;

          const aiScore = computeApplicationScore({
            overallScore: app.overall_score,
            resumeScore,
            technicalScore: techScore,
            interviewScore: intScore,
          });

          const fitBandVal = getFitBand(aiScore);
          const daysInStage = Math.floor((Date.now() - new Date(app.updated_at).getTime()) / 86400000);

          return {
            applicationId:     app.id,
            candidateId:       app.candidate_id,
            candidateName:     user?.name  || 'Unknown',
            candidateEmail:    user?.email || '',
            position:          app.Job?.title || 'N/A',
            applicationStatus: app.status,
            aiScore, fitBand: fitBandVal,
            integrityScore:    app.Candidate?.integrity_score || null,
            daysInStage, resumeScore, technicalScore: techScore, interviewScore: intScore,
            malpracticeCount:  app.MalpracticeEvents?.length || 0,
          };
        });

      if (fitBand && fitBand !== 'all') {
        candidates = candidates.filter(c => c.fitBand === fitBand);
      }
      
      if (search) {
        const q = search.toLowerCase();
        candidates = candidates.filter(c => 
          c.candidateName.toLowerCase().includes(q) || 
          String(c.candidateId).includes(q)
        );
      }

      if (role && role !== 'all') {
        candidates = candidates.filter(c => c.position === role);
      }

      if (stage && stage !== 'all') {
         // Optionally normalize if needed, but assuming exact backend status here
         candidates = candidates.filter(c => c.applicationStatus === stage);
      }

      if (minSkillMatch) {
         const threshold = parseInt(minSkillMatch, 10);
         if (!isNaN(threshold)) {
             candidates = candidates.filter(c => c.resumeScore >= threshold);
         }
      }

      if (sortByFitBand === 'true' || sortByFitBand === 'desc') {
         // Sort order logic: high_fit > avg_fit > low_fit
         const bandVal = { high_fit: 3, avg_fit: 2, low_fit: 1 };
         candidates.sort((a, b) => bandVal[b.fitBand] - bandVal[a.fitBand]);
      } else if (sortByFitBand === 'asc') {
         const bandVal = { high_fit: 3, avg_fit: 2, low_fit: 1 };
         candidates.sort((a, b) => bandVal[a.fitBand] - bandVal[b.fitBand]);
      }

      return res.status(200).json({ success: true, count: candidates.length, data: candidates });

    } catch (error) {
      console.error('Error fetching pipeline:', error);
      return res.status(500).json({ success: false, message: 'Error fetching pipeline data' });
    }
  }
}

const scoringService = require('../services/scoring.service');

function buildProsCons({ resumeScore, technicalScore, interviewScore, malpracticeScore = 0 }, { resumeAnalysis, assessmentAnalysis, interviewAnalysis }) {
  // 1. Compute ML Regression Final Score & Classification
  const prediction = scoringService.predictFinalScore({
    resumeScore: resumeScore || 0,
    assessmentScore: technicalScore || 0,
    interviewScore: interviewScore || 0,
    malpracticeScore: malpracticeScore || 0,
    aiAvailable: (resumeAnalysis?.ai_model_used?.includes('gemini') || interviewAnalysis?.method?.includes('AI'))
  });

  // Utility: Guarantee exactly 5 items, padding with intelligent role-based fallbacks
  const padTo5 = (items, fallbacks) => {
    const result = Array.isArray(items) ? [...items] : [];
    let i = 0;
    while (result.length < 5 && i < fallbacks.length) {
      if (!result.includes(fallbacks[i])) result.push(fallbacks[i]);
      i++;
    }
    const generic = [
      'Professional documentation standards met',
      'Industry awareness demonstrated',
      'Analytical approach observed',
      'Communication baseline established',
      'Commitment to role requirements shown'
    ];
    let j = 0;
    while (result.length < 5) { result.push(generic[j % generic.length]); j++; }
    return result.slice(0, 5);
  };

  const p = (score, goodFallbacks, badFallbacks, neutralFallback, aiStrengths = [], aiWeaknesses = [], modelUsed = '') => {
    const rawStrengths = Array.isArray(aiStrengths) ? aiStrengths : [];
    const rawWeaknesses = Array.isArray(aiWeaknesses) ? aiWeaknesses : [];

    const strengthFallbacks = score >= 70 ? goodFallbacks : [
      neutralFallback,
      'Candidate completed the evaluation stage',
      'Baseline competency acknowledged',
      'Participation demonstrates engagement',
      'Potential for role-specific training'
    ];
    const weaknessFallbacks = score < 60 ? badFallbacks : [
      'Advanced domain proficiency to be verified',
      'Practical experience depth requires validation',
      'Cross-functional collaboration history unclear',
      'Leadership demonstration scope limited',
      'Specialized certification gaps possible'
    ];

    return {
      pros: padTo5(rawStrengths, strengthFallbacks),
      cons: padTo5(rawWeaknesses, weaknessFallbacks),
      aiModel: modelUsed || 'system-hybrid-v1',
      isManual: modelUsed?.includes('fallback') || modelUsed?.includes('manual')
    };
  };
  
  const resume = p(
    resumeScore,
    ['Strong JD skill alignment', 'High keyword density for role', 'Relevant educational credentials', 'Domain experience highlighted', 'Quantifiable achievements present'],
    ['JD match below ideal threshold', 'Missing key technical skills', 'Limited relevant experience indicated', 'Education gap for role level', 'Achievement metrics unclear'],
    'Resume successfully parsed and evaluated',
    resumeAnalysis?.strengths, resumeAnalysis?.weaknesses, resumeAnalysis?.ai_model_used
  );
  
  const assessment = p(
    technicalScore,
    ['Strong technical accuracy across questions', 'Correct conceptual understanding shown', 'Structured problem-solving approach', 'Domain knowledge depth demonstrated', 'Efficient solution methodology'],
    ['Accuracy gaps in technical responses', 'Core concept understanding requires improvement', 'Problem-solving approach needs refinement', 'Domain knowledge verification recommended', 'Answer completeness below benchmark'],
    'Technical assessment completed and evaluated',
    assessmentAnalysis?.strengths, assessmentAnalysis?.weaknesses, assessmentAnalysis?.ai_model_used
  );
  
  const interviewRes = p(
    interviewScore,
    ['Clear and articulate communication', 'Confident response delivery observed', 'Structured answers with relevant examples', 'Strong role-scenario awareness', 'Professional interview presentation'],
    ['Communication clarity needs improvement', 'Response depth below expected level', 'Filler word usage impacts perception', 'Technical vocabulary limited for role', 'Scenario-based thinking requires enhancement'],
    'AI video interview evaluated',
    interviewAnalysis?.strengths, interviewAnalysis?.weaknesses, interviewAnalysis?.method
  );

  const aggregatedScore = prediction.finalScore;
  const finalRecommendation = prediction.classification === 'HIRE' ? 'Strong Hire' : prediction.classification === 'HOLD' ? 'Recommended' : 'Weak Fit';
  const reasoning = prediction.insights.recommendation +
    (malpracticeScore > 5 ? ` [Integrity Flag: Candidate had ${malpracticeScore} proctoring violation(s)]` : '');

  const finalStrengths = padTo5(
    prediction.insights.strengths,
    ['Completed full multi-stage evaluation pipeline', 'Demonstrated commitment through all assessment phases', 'Sufficient score to advance to HR review', 'Profile analyzed across resume, technical, and interview', 'Baseline fit established for role consideration']
  );
  const finalWeaknesses = padTo5(
    prediction.insights.weaknesses,
    ['Final decision pending HR panel review', 'Cross-stage performance consistency to verify', 'Role-specific training may be required', 'Peer benchmark comparison recommended', 'Reference verification suggested before final offer']
  );

  return [
    { stage: 'RESUME_PARSING', overallScore: resumeScore, ...resume },
    { stage: 'TECHNICAL_ASSESSMENT', overallScore: technicalScore, ...assessment },
    { stage: 'AI_INTERVIEW', overallScore: interviewScore, ...interviewRes },
    {
      stage: 'FINAL_RECOMMENDATION',
      overallScore: aggregatedScore,
      decision: finalRecommendation,
      pros: finalStrengths,
      cons: finalWeaknesses,
      summary: reasoning,
      whyToHireReasoning: reasoning,
      confidence: prediction.confidence,
      method: prediction.methodUsed,
      isManual: resume.isManual || assessment.isManual || interviewRes.isManual
    },
  ];
}

module.exports = CandidateProfileController;
