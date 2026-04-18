import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DossierData {
  application: any;
  aiAnalysis: any;
}

export const generateDossierPDF = (data: DossierData) => {
  const { application, aiAnalysis } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Branding
  doc.setFillColor(59, 130, 246); // Blue-500
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("CANDIDATE DOSSIER", 20, 25);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, 25, { align: "right" });

  // Candidate Basic Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text("BASIC INFORMATION", 20, 55);
  doc.setLineWidth(0.5);
  doc.line(20, 57, pageWidth - 20, 57);

  autoTable(doc, {
    startY: 65,
    head: [["Field", "Details"]],
    body: [
      ["Candidate Name", application.candidate_name || "N/A"],
      ["Email", application.candidate_email || "N/A"],
      ["Job Applied", application.job_title || "N/A"],
      ["Final AI Score", `${application.overall_score || 0}/100`],
      ["Status", application.status?.replace(/_/g, " ") || "N/A"],
    ],
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  });

  // AI Scores Breakdown
  doc.setFontSize(14);
  doc.text("AI SCORING BREAKDOWN", 20, (doc as any).lastAutoTable.finalY + 15);
  
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [["Category", "Score", "AI Insight"]],
    body: [
      ["Resume Match", `${application.resume_score || 0}%`, aiAnalysis.resume_analysis?.overall_score > 70 ? "Strong technical alignment" : "Moderate alignment"],
      ["Technical Assessment", `${application.technical_score || 0}%`, aiAnalysis.assessment_analyses?.[0]?.overall_score > 70 ? "Expert topic proficiency" : "Foundational knowledge"],
      ["AI Interview", `${application.interview_score || 0}%`, aiAnalysis.interview_analysis?.overall_score > 70 ? "Excellent communication" : "Average communication"],
    ],
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] }, // Purple-500
  });

  // Strengths & Risks (Pros/Cons)
  doc.setFontSize(14);
  const startY = (doc as any).lastAutoTable.finalY + 15;
  doc.text("STRENGTHS & PROS", 20, startY);
  
  const pros = [
    ...(aiAnalysis.resume_analysis?.strengths || []),
    ...(aiAnalysis.assessment_analyses?.[0]?.strengths || []),
    ...(aiAnalysis.interview_analysis?.strengths || []),
  ].slice(0, 5);

  autoTable(doc, {
    startY: startY + 5,
    body: pros.map(p => [`• ${p}`]),
    theme: "plain",
    styles: { fontSize: 10, textColor: [21, 128, 61] }, // Green-700
  });

  doc.setFontSize(14);
  const consY = (doc as any).lastAutoTable.finalY + 10;
  doc.text("IDENTIFIED RISKS / CONS", 20, consY);
  
  const cons = [
    ...(aiAnalysis.resume_analysis?.weaknesses || []),
    ...(aiAnalysis.assessment_analyses?.[0]?.weaknesses || []),
    ...(aiAnalysis.interview_analysis?.red_flags || []),
  ].slice(0, 5);

  autoTable(doc, {
    startY: consY + 5,
    body: cons.map(c => [`• ${c}`]),
    theme: "plain",
    styles: { fontSize: 10, textColor: [185, 28, 28] }, // Red-700
  });

  // Assessment Detailed Q&A
  if (aiAnalysis.assessment_analyses && aiAnalysis.assessment_analyses.length > 0) {
    const assessment = aiAnalysis.assessment_analyses[0];
    if (assessment.detailed_qa && assessment.detailed_qa.length > 0) {
      doc.addPage();
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text("TECHNICAL ASSESSMENT: DETAILED Q&A", 20, 13);
      
      const qaBody = assessment.detailed_qa.map((qa: any, idx: number) => [
        idx + 1,
        qa.question_text,
        qa.candidate_answer || "No Response",
        qa.correct_answer || "N/A"
      ]);

      autoTable(doc, {
        startY: 30,
        head: [["#", "Question", "Candidate Answer", "Expected Answer"]],
        body: qaBody,
        theme: "striped",
        headStyles: { fillColor: [71, 85, 105] }, // Slate-600
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 80 },
          2: { cellWidth: 50 },
          3: { cellWidth: 40 }
        },
        styles: { fontSize: 8, overflow: 'linebreak' }
      });
    }
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`AI-Generated Professional Dossier | Confidential | Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
  }

  doc.save(`${application.candidate_name?.replace(/\s+/g, "_")}_Dossier.pdf`);
};
