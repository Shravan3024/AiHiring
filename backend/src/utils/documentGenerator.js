const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class DocumentGenerator {
  /**
   * Generate offer letter PDF
   */
  static generateOfferLetter(applicationData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 50,
          size: 'A4'
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('OFFER LETTER', {
          align: 'center'
        });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(
          `Date: ${moment().format('MMMM DD, YYYY')}`,
          { align: 'center' }
        );
        doc.moveDown(1);

        // Candidate details
        doc.fontSize(11).font('Helvetica-Bold').text('TO:', { underline: true });
        doc.font('Helvetica').text(applicationData.candidateName);
        doc.text(applicationData.candidateEmail);
        doc.text(applicationData.candidatePhone);
        doc.moveDown(1);

        // Salutation
        doc.text(`Dear ${applicationData.candidateName},`);
        doc.moveDown(1);

        // Body
        doc.fontSize(10).font('Helvetica').text(
          `We are pleased to offer you the position of ${applicationData.jobTitle} at ${applicationData.companyName}.`,
          { align: 'justify', lineGap: 4 }
        );
        doc.moveDown(0.5);

        // Job details table
        const jobDetailsX = 50;
        const detailsTableTop = doc.y;

        doc.fontSize(11).font('Helvetica-Bold').text('POSITION DETAILS:', { underline: true });
        doc.moveDown(0.3);

        this.createTable(doc, [
          ['Position Title:', applicationData.jobTitle],
          ['Department:', applicationData.department || 'Not specified'],
          ['Location:', applicationData.location || 'Not specified'],
          ['Start Date:', moment(applicationData.startDate).format('MMMM DD, YYYY')],
          ['Employment Type:', applicationData.employmentType || 'Full-time'],
          ['Reports To:', applicationData.reportsTo || 'HR Manager']
        ]);

        doc.moveDown(0.5);

        // Compensation
        doc.fontSize(11).font('Helvetica-Bold').text('COMPENSATION PACKAGE:', { underline: true });
        doc.moveDown(0.3);

        this.createTable(doc, [
          ['Base Salary:', `${this.formatCurrency(applicationData.salary)}`],
          ['Benefits:', applicationData.benefits || 'Standard company benefits'],
          ['Vacation Days:', `${applicationData.vacationDays || 20} days/year`],
          ['Health Insurance:', 'Comprehensive coverage'],
          ['Retirement Plan:', 'Company 401(k) match up to 4%']
        ]);

        doc.moveDown(1);

        // Conditions
        doc.fontSize(11).font('Helvetica-Bold').text('TERMS AND CONDITIONS:', { underline: true });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text([
          '• This offer is contingent upon successful background check and reference verification',
          '• Employment will be at-will, subject to company policies',
          '• Candidate must complete all required compliance and training within 30 days',
          '• Confidentiality and non-compete agreements must be signed before start date'
        ], { lineGap: 3 });

        doc.moveDown(1);

        // Closing
        doc.fontSize(10).font('Helvetica').text(
          'Please confirm your acceptance of this offer by signing and returning this letter by ' +
          moment().add(7, 'days').format('MMMM DD, YYYY') + '.',
          { align: 'justify', lineGap: 4 }
        );

        doc.moveDown(2);

        // Signature section
        doc.fontSize(10).font('Helvetica').text('Accepted by:', { underline: true });
        doc.moveDown(2);
        doc.text('_____________________________');
        doc.text(`${applicationData.candidateName}, Date: _________________`);

        doc.moveDown(2);

        // Authorized by
        doc.text('On behalf of ' + applicationData.companyName + ':');
        doc.moveDown(2);
        doc.text('_____________________________');
        doc.text('HR Manager, Date: _________________');

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate interview summary report
   */
  static generateInterviewSummary(interviewData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('INTERVIEW ASSESSMENT REPORT', {
          align: 'center'
        });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(
          `Generated: ${moment().format('MMMM DD, YYYY HH:mm')}`,
          { align: 'center' }
        );
        doc.moveDown(1);

        // Candidate info
        doc.fontSize(11).font('Helvetica-Bold').text('CANDIDATE INFORMATION:');
        doc.moveDown(0.3);
        this.createTable(doc, [
          ['Candidate:', interviewData.candidateName],
          ['Position:', interviewData.jobTitle],
          ['Interview Date:', moment(interviewData.interviewDate).format('MMMM DD, YYYY')],
          ['Interviewer:', interviewData.interviewerName]
        ]);

        doc.moveDown(0.5);

        // Performance metrics
        doc.fontSize(11).font('Helvetica-Bold').text('PERFORMANCE METRICS:');
        doc.moveDown(0.3);

        const metrics = [
          ['Technical Knowledge', interviewData.technicalScore || 0, 100],
          ['Communication', interviewData.communicationScore || 0, 100],
          ['Problem Solving', interviewData.problemSolvingScore || 0, 100],
          ['Cultural Fit', interviewData.culturalFitScore || 0, 100],
          ['Overall Assessment', interviewData.overallScore || 0, 100]
        ];

        metrics.forEach(([label, score, max]) => {
          doc.fontSize(10).text(`${label}:`, { continued: true });
          doc.text(` ${score}/${max}`, { align: 'right' });
          
          // Draw progress bar
          const barWidth = 300;
          const filledWidth = (score / max) * barWidth;
          doc.rect(50, doc.y, barWidth, 15).stroke();
          doc.rect(50, doc.y, filledWidth, 15).fill('#4CAF50');
          doc.moveDown(0.8);
        });

        doc.moveDown(0.5);

        // Feedback
        doc.fontSize(11).font('Helvetica-Bold').text('INTERVIEWER FEEDBACK:');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
          interviewData.feedback || 'No additional feedback provided',
          { align: 'justify', lineGap: 4 }
        );

        doc.moveDown(0.5);

        // Strengths
        doc.fontSize(11).font('Helvetica-Bold').text('KEY STRENGTHS:');
        doc.moveDown(0.3);
        const strengths = interviewData.strengths || [];
        strengths.forEach(strength => {
          doc.fontSize(10).font('Helvetica').text(`• ${strength}`);
        });

        doc.moveDown(0.5);

        // Areas for improvement
        doc.fontSize(11).font('Helvetica-Bold').text('AREAS FOR IMPROVEMENT:');
        doc.moveDown(0.3);
        const improvements = interviewData.areasForImprovement || [];
        improvements.forEach(area => {
          doc.fontSize(10).font('Helvetica').text(`• ${area}`);
        });

        doc.moveDown(1);

        // Recommendation
        doc.fontSize(11).font('Helvetica-Bold').text('RECOMMENDATION:');
        doc.moveDown(0.3);
        const recommendation = interviewData.recommendation || 'PENDING';
        const recommendationColor = {
          'STRONG_YES': '#4CAF50',
          'YES': '#8BC34A',
          'MAYBE': '#FF9800',
          'NO': '#F44336'
        }[recommendation] || '#2196F3';
        
        doc.fontSize(12).fillColor(recommendationColor).font('Helvetica-Bold')
          .text(recommendation.replace(/_/g, ' '));

        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate assessment report
   */
  static generateAssessmentReport(assessmentData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('TECHNICAL ASSESSMENT REPORT', {
          align: 'center'
        });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(
          `Date: ${moment().format('MMMM DD, YYYY')}`,
          { align: 'center' }
        );
        doc.moveDown(1);

        // Test details
        doc.fontSize(11).font('Helvetica-Bold').text('ASSESSMENT DETAILS:');
        doc.moveDown(0.3);
        this.createTable(doc, [
          ['Candidate:', assessmentData.candidateName],
          ['Position:', assessmentData.jobTitle],
          ['Test Duration:', `${assessmentData.duration || 30} minutes`],
          ['Test Date:', moment(assessmentData.testDate).format('MMMM DD, YYYY')]
        ]);

        doc.moveDown(0.5);

        // Score breakdown
        doc.fontSize(11).font('Helvetica-Bold').text('SCORE BREAKDOWN:');
        doc.moveDown(0.3);

        const scoreDetails = [
          ['Total Score:', `${assessmentData.totalScore}/${assessmentData.totalQuestions * 10}`],
          ['Correct Answers:', `${assessmentData.correctAnswers}/${assessmentData.totalQuestions}`],
          ['Pass Mark:', `${assessmentData.passingScore}%`],
          ['Result:', assessmentData.totalScore >= assessmentData.passingScore ? 'PASSED' : 'FAILED']
        ];

        scoreDetails.forEach(([label, value]) => {
          doc.fontSize(10).font('Helvetica').text(`${label}:`, { continued: true });
          doc.text(value, { align: 'right' });
        });

        doc.moveDown(0.5);

        // Section-wise performance
        doc.fontSize(11).font('Helvetica-Bold').text('SECTION-WISE PERFORMANCE:');
        doc.moveDown(0.3);

        const sections = assessmentData.sections || [];
        sections.forEach(section => {
          doc.fontSize(10).font('Helvetica').text(
            `${section.name}: ${section.score}/${section.total} (${Math.round((section.score/section.total)*100)}%)`
          );
        });

        doc.moveDown(0.5);

        // Proctoring summary
        if (assessmentData.integrityScore !== undefined) {
          doc.fontSize(11).font('Helvetica-Bold').text('PROCTORING SUMMARY:');
          doc.moveDown(0.3);

          const integrityDetails = [
            ['Integrity Score:', `${assessmentData.integrityScore}/100`],
            ['Violations Detected:', assessmentData.violationCount || 0],
            ['Proctoring Status:', assessmentData.integrityScore >= 70 ? 'PASSED' : 'FLAGGED']
          ];

          integrityDetails.forEach(([label, value]) => {
            doc.fontSize(10).font('Helvetica').text(`${label}:`, { continued: true });
            doc.text(value, { align: 'right' });
          });
        }

        doc.moveDown(1);

        // Final recommendation
        doc.fontSize(11).font('Helvetica-Bold').text('OVERALL ASSESSMENT:');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(
          assessmentData.recommendation || 'Candidate performed adequately in the technical assessment.',
          { align: 'justify', lineGap: 4 }
        );

        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate final hiring decision letter
   */
  static generateFinalDecisionLetter(applicationData, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Header
        const isAccepted = applicationData.finalDecision === 'ACCEPTED';
        const letterTitle = isAccepted ? 'FORMAL OFFER OF EMPLOYMENT' : 'HIRING DECISION LETTER';
        
        doc.fontSize(22).font('Helvetica-Bold').text(letterTitle, {
          align: 'center'
        });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(
          `${moment().format('MMMM DD, YYYY')}`,
          { align: 'center' }
        );
        doc.moveDown(1.5);

        // Recipient
        doc.fontSize(11).font('Helvetica').text(applicationData.candidateName);
        doc.text(applicationData.candidateEmail);
        doc.moveDown(1);

        // Salutation
        doc.text(`Dear ${applicationData.candidateName},`);
        doc.moveDown(1);

        if (isAccepted) {
          // Acceptance letter body
          doc.fontSize(10).font('Helvetica').text(
            `We are pleased to confirm that you have been selected for the position of ${applicationData.jobTitle} ` +
            `at ${applicationData.companyName}.`,
            { align: 'justify', lineGap: 4 }
          );

          doc.moveDown(0.5);
          doc.text(
            'Based on your excellent performance throughout our recruitment process, including your strong ' +
            'technical skills, professional conduct, and cultural alignment with our organization, we are ' +
            'confident that you will be a valuable addition to our team.',
            { align: 'justify', lineGap: 4 }
          );

          doc.moveDown(0.5);

          // Employment terms
          doc.fontSize(11).font('Helvetica-Bold').text('EMPLOYMENT TERMS:');
          doc.moveDown(0.3);

          this.createTable(doc, [
            ['Designation:', applicationData.jobTitle],
            ['Department:', applicationData.department],
            ['Start Date:', moment(applicationData.startDate).format('MMMM DD, YYYY')],
            ['Base Salary:', this.formatCurrency(applicationData.salary)],
            ['Employment Type:', 'Full-time Permanent']
          ]);

          doc.moveDown(1);

          doc.fontSize(11).font('Helvetica-Bold').text('NEXT STEPS:');
          doc.moveDown(0.3);
          doc.fontSize(10).font('Helvetica').text([
            '1. Sign and return this acceptance letter by ' + moment().add(5, 'days').format('MMMM DD, YYYY'),
            '2. Complete the background verification process',
            '3. Provide proof of eligibility to work',
            '4. Complete required compliance training before start date',
            '5. Report to your designated manager on your start date'
          ], { lineGap: 3 });
        } else {
          // Rejection letter body
          doc.fontSize(10).font('Helvetica').text(
            `Thank you for your interest in the position of ${applicationData.jobTitle} at ${applicationData.companyName}.`,
            { align: 'justify', lineGap: 4 }
          );

          doc.moveDown(0.5);
          doc.text(
            'After careful consideration of your application and performance during our recruitment process, ' +
            'we regret to inform you that we have decided to move forward with other candidates who more closely ' +
            'match the specific requirements of this position.',
            { align: 'justify', lineGap: 4 }
          );

          doc.moveDown(0.5);
          doc.text(
            'We appreciate the time and effort you invested in this process. We encourage you to apply for future ' +
            'opportunities with our organization that may better align with your qualifications.',
            { align: 'justify', lineGap: 4 }
          );
        }

        doc.moveDown(2);

        // Closing
        doc.fontSize(10).font('Helvetica').text('Sincerely,');
        doc.moveDown(2);
        doc.text('_____________________________');
        doc.text('Hiring Manager');
        doc.text(applicationData.companyName);

        doc.end();
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Helper: Create formatted table
   */
  static createTable(doc, rows, colWidths = [150, 350]) {
    const startY = doc.y;
    const rowHeight = 20;
    const x = 50;

    rows.forEach((row, rowIndex) => {
      const y = startY + (rowIndex * rowHeight);
      
      // Left column
      doc.fontSize(9).font('Helvetica-Bold').text(row[0], x, y, { width: colWidths[0] });
      
      // Right column
      doc.fontSize(9).font('Helvetica').text(row[1], x + colWidths[0], y, { width: colWidths[1] });
    });

    doc.moveDown(rows.length);
  }

  /**
   * Helper: Format currency
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Merge documents into single PDF
   */
  static async mergeDocuments(documentPaths, outputPath) {
    // Using pdf-merge or similar library would be needed
    // This is a placeholder for the actual implementation
    throw new Error('Document merging requires additional library setup');
  }
}

module.exports = DocumentGenerator;
