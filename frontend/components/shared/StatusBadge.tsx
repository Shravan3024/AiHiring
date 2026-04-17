import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" | "purple" | "orange" }> = {
  PENDING: { label: "Pending", variant: "warning" },
  APPLIED: { label: "Applied", variant: "default" },
  RESUME_SUBMITTED: { label: "Resume Submitted", variant: "default" },
  RESUME_EVALUATED: { label: "Resume Evaluated", variant: "purple" },
  ASSESSMENT_UNLOCKED: { label: "Assessment Unlocked", variant: "warning" },
  TECHNICAL_ROUND_PENDING: { label: "Technical Pending", variant: "warning" },
  TECHNICAL_ROUND_IN_PROGRESS: { label: "Technical In Progress", variant: "purple" },
  TECHNICAL_ROUND_COMPLETED: { label: "Technical Completed", variant: "purple" },
  INTERVIEW_UNLOCKED: { label: "Interview Unlocked", variant: "warning" },
  SHORTLISTED: { label: "Shortlisted", variant: "purple" },
  MCQ_PENDING: { label: "MCQ Pending", variant: "warning" },
  MCQ_PASSED: { label: "MCQ Passed", variant: "success" },
  MCQ_FAILED: { label: "MCQ Failed", variant: "destructive" },
  INTERVIEW_SCHEDULED: { label: "Interview Scheduled", variant: "default" },
  INTERVIEW_COMPLETED: { label: "Interview Done", variant: "purple" },
  HR_REVIEW: { label: "HR Review", variant: "warning" },
  PROCEED_TO_HR: { label: "Proceed to HR", variant: "warning" },
  RECOMMENDED_BY_AI: { label: "Recommended by AI", variant: "success" },
  AUTO_REJECTED: { label: "Auto Rejected", variant: "destructive" },
  OFFER_SENT: { label: "Offer Sent", variant: "orange" },
  OFFERED: { label: "Offered", variant: "orange" },
  OFFER_ACCEPTED: { label: "Offer Accepted", variant: "success" },
  OFFER_REJECTED: { label: "Offer Rejected", variant: "destructive" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  HIRED: { label: "Hired", variant: "success" },
  ACTIVE: { label: "Active", variant: "success" },
  CLOSED: { label: "Closed", variant: "secondary" },
  DRAFT: { label: "Draft", variant: "outline" },
  APPROVED: { label: "Approved", variant: "success" },
  ESCALATED: { label: "Escalated", variant: "warning" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status?.toUpperCase()] || { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
