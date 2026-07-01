export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type ReviewStatus = "Clean" | "Warning" | "Action Required" | "Scanning...";

export type ConfidenceLevel = "Low" | "Medium" | "High";

export type DeviationStatus = "Major Deviation" | "Minor Deviation" | "No Deviation";

export interface Clause {
  id: string;
  name: string;
  text: string;
  riskLevel: RiskLevel;
  confidenceLevel: ConfidenceLevel;
  status: "Needs Review" | "Confirmed" | "AI-Suggested";
  score: number;
  explanation?: string;
  recommendation?: string;
  suggestedWording?: string;
  reviewHistory?: ReviewHistoryEntry[];
}

export interface KeyDeadline {
  id: string;
  title: string;
  date: string; // e.g. "Dec 15, 2024"
  isCritical: boolean; // clock in orange and yellow border if critical
}

export interface KeyObligation {
  id: string;
  text: string;
}

export interface FinancialCommitment {
  id: string;
  name: string;
  value: string;
}

export interface AISummary {
  executiveSummary?: string;
  obligations: KeyObligation[];
  deadlines: KeyDeadline[];
  financialCommitments: FinancialCommitment[];
  renewalTerms?: string[];
  terminationConditions?: string[];
  topRisks?: string[];
  recommendedNextSteps?: string[];
}

export interface ClauseComparison {
  id: string;
  clauseName: string;
  deviationType: DeviationStatus;
  approvedText: string;
  contractText: string;
}

export interface ReviewHistoryEntry {
  id: string;
  user: string;
  action: string;
  date: string;
}

export interface VersionComparison {
  id: string;
  clauseName: string;
  status: "Added" | "Removed" | "Modified" | "Unchanged";
  originalText?: string;
  currentText?: string;
}

export interface ComplianceRecord {
  id: string;
  contractId: string;
  framework: "GDPR" | "CCPA" | "HIPAA" | "PCI DSS" | "SOX";
  status: "Pass" | "Fail" | "Warning";
  score: number;
  lastChecked: string;
  issues: string[];
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[]; // e.g., ["[Section 4.2]", "[Section 8.1]"]
}

export interface Contract {
  id: string;
  name: string;
  counterparty: string;
  type: string;
  effectiveDate: string;
  value: string; // e.g. "$85,000/yr"
  overallRisk: RiskLevel;
  score: number;
  clausesCount: number;
  status: ReviewStatus;
  
  // Embedded relationships to enable API readiness
  clauses?: Clause[];
  aiSummary?: AISummary;
  comparisons?: ClauseComparison[];
  history?: ReviewHistoryEntry[];
  versionComparisons?: VersionComparison[];
  complianceRecords?: ComplianceRecord[];
  notes?: string;
  chatHistory?: ChatMessage[];
}
