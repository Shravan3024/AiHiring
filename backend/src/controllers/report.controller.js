const PDFDocument = require('pdfkit');
const { Application, Candidate, User, Job, AssessmentAttempt, TechnicalQuestionBank, MalpracticeEvent } = require('../models');

exports.generateCandidateReport = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findByPk(applicationId, {
      include: [
        { model: Candidate, include: [User] },
        { model: Job },
        { model: AssessmentAttempt, where: { assessment_type: 'TECHNICAL' }, required: false }
      ]
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const attempt = application.AssessmentAttempt || application.AssessmentAttempts?.[0];
    let questions = [];
    if (attempt && attempt.metadata?.question_ids) {
      questions = await TechnicalQuestionBank.findAll({
        where: { questionId: attempt.metadata.question_ids }
      });
    }

    const malpracticeEvents = await MalpracticeEvent.findAll({
      where: { application_id: applicationId },
      order: [['created_at', 'ASC']]
    });

    // --- Start PDF Generation ---
    const doc = new PDFDocument({ margin: 50 });
    
    // HTTP Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Evaluation_Report_${application.Candidate?.User?.name?.replace(/\s+/g, '_')}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fillColor('#1d4ed8').fontSize(24).text('CANDIDATE EVALUATION REPORT', { align: 'center' });
    doc.fillColor('#64748b').fontSize(10).text('MASK POLYMERS INDUSTRIAL RECRUITMENT HUB', { align: 'center' });
    doc.moveDown(2);

    // Section: Candidate Profile
    doc.rect(50, doc.y, 500, 100).fill('#f8fafc');
    doc.fillColor('#1e293b').fontSize(14).text('Candidate Profile', 60, doc.y + 10);
    doc.fontSize(10).fillColor('#475569');
    doc.text(`Name: ${application.Candidate?.User?.name || 'N/A'}`, 60, doc.y + 15);
    doc.text(`Email: ${application.Candidate?.User?.email || 'N/A'}`, 60, doc.y + 5);
    doc.text(`Position: ${application.Job?.title || 'N/A'}`, 60, doc.y + 5);
    doc.text(`Status: ${application.status}`, 60, doc.y + 5);
    
    doc.moveDown(6);

    // Section: Summary Scores
    doc.fillColor('#1e293b').fontSize(14).text('Performance Matrix', 50);
    doc.moveDown();
    
    const scoreY = doc.y;
    doc.rect(50, scoreY, 150, 40).stroke('#e2e8f0');
    doc.fontSize(8).text('RESUME SCORE', 60, scoreY + 10);
    doc.fontSize(12).text(`${application.resume_score || 0}%`, 60, scoreY + 22);

    doc.rect(210, scoreY, 150, 40).stroke('#e2e8f0');
    doc.fontSize(8).text('TECHNICAL SCORE', 220, scoreY + 10);
    doc.fontSize(12).text(`${application.technical_score || 0}%`, 220, scoreY + 22);

    doc.rect(370, scoreY, 150, 40).stroke('#e2e8f0');
    doc.fontSize(8).text('OVERALL AI MATCH', 380, scoreY + 10);
    doc.fontSize(12).text(`${application.overall_score || 0}%`, 380, scoreY + 22);

    doc.moveDown(4);

    // Section: Assessment Breakdown
    doc.fillColor('#1e293b').fontSize(14).text('Technical Assessment Breakdown', 50);
    doc.moveDown();

    if (!attempt || questions.length === 0) {
      doc.fontSize(10).fillColor('#94a3b8').text('No technical assessment data available for this candidate.');
    } else {
      const answers = attempt.answers || {};
      
      questions.forEach((q, index) => {
        if (doc.y > 650) doc.addPage();
        
        doc.fontSize(10).fillColor('#1e293b').text(`${index + 1}. ${q.question}`, { bold: true });
        doc.moveDown(0.5);
        
        const candidateAns = answers[q.questionId]?.answer_text || 'No response recorded';
        const expectedAns = q.correct_answer || q.expected_answer || 'N/A';
        
        doc.fontSize(9).fillColor('#475569').text('Candidate Answer: ', { continued: true }).fillColor('#1e293b').text(candidateAns);
        doc.fillColor('#475569').text('System Reference: ', { continued: true }).fillColor('#059669').text(expectedAns);
        
        doc.moveDown(1);
      });
    }

    doc.moveDown(2);

    // Section: Integrity Audit
    if (doc.y > 600) doc.addPage();
    doc.fillColor('#1e293b').fontSize(14).text('Integrity Audit (Proctoring)', 50);
    doc.moveDown();

    if (malpracticeEvents.length === 0) {
      doc.fontSize(10).fillColor('#059669').text('Integrity Verified: No malpractice events detected during session.');
    } else {
      doc.fontSize(9).fillColor('#e11d48').text(`ALERT: ${malpracticeEvents.length} potential violations detected.`);
      doc.moveDown(0.5);
      malpracticeEvents.forEach(evt => {
        doc.fontSize(8).fillColor('#475569').text(`[${new Date(evt.created_at).toLocaleTimeString()}] Type: ${evt.type} | Severity: ${evt.severity}`);
      });
    }

    // Footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#94a3b8').text(
        `Page ${i + 1} of ${pages.count} | Generated by Mask Polymers AI Engine`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
};
