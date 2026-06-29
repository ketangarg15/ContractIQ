from typing import Literal, Optional, Dict, List
from pydantic import BaseModel, Field

# 1. Summary
class SummaryKeyPoint(BaseModel):
    label: str  # "Term", "Payment", "Liability", etc.
    value: str

class ContractSummary(BaseModel):
    narrative: str
    key_points: List[SummaryKeyPoint]

# 2. Risk Analysis
class RiskItem(BaseModel):
    category: str  # Financial / Legal / Operational / Compliance / Reputational
    severity: Literal["Low", "Medium", "High", "Critical"]
    description: str
    recommendation: str

class RiskAnalysis(BaseModel):
    items: List[RiskItem]
    overall_summary: str
    risk_score: int  # 0-100

# 3. Red Flags
class RedFlag(BaseModel):
    title: str
    severity: Literal["Low", "Medium", "High", "Critical"]
    location: str       # clause/section reference, e.g. "§ 9.2 Indemnification"
    description: str
    recommendation: str

class RedFlagReport(BaseModel):
    flags: List[RedFlag]
    counts_by_severity: Dict[str, int]

# 4. Compliance
class ComplianceCheckItem(BaseModel):
    requirement: str
    status: Literal["Compliant", "Non-Compliant", "Partially Compliant", "Not Applicable"]
    finding: str
    recommendation: Optional[str] = None

class ComplianceFramework(BaseModel):
    framework: str          # "GDPR" | "HIPAA" | "PCI DSS"
    applicable: bool
    overall_status: Literal["Pass", "Gap", "Partial", "N/A"]
    items: List[ComplianceCheckItem]

class ComplianceReport(BaseModel):
    frameworks: List[ComplianceFramework]

# 5. Clauses
class Clause(BaseModel):
    clause_type: str
    category: str           # Term & Renewal, Payment, Liability, Indemnification, Confidentiality, Termination, IP & Ownership, Dispute Resolution, General
    reference: Optional[str] = None   # e.g. "§ 8.1"
    extracted_text: str
    summary: str

class ClauseExtraction(BaseModel):
    clauses: List[Clause]

# 6. Obligations
class Obligation(BaseModel):
    obligation_type: str  # Payment / Delivery / Reporting / Renewal / Termination Notice / Compliance / Other
    description: str
    responsible_party: str
    due_date: Optional[str] = None      # raw string, e.g. "Net-45"
    status: Literal["Pending", "Recurring", "Conditional", "Upcoming", "Ongoing"]

class ObligationReport(BaseModel):
    obligations: List[Obligation]
    critical_summary: str

# 7. NER Entities
class Entity(BaseModel):
    text: str
    type: Literal["Person", "Organization", "Date", "Monetary Amount", "Jurisdiction", "Address", "Percentage", "Duration"]
    context: str

class EntityReport(BaseModel):
    entities: List[Entity]

# 8. Negotiation Suggestions
class NegotiationSuggestion(BaseModel):
    clause_name: str
    reference: Optional[str] = None
    current_wording: str
    suggested_wording: str
    rationale: str
    priority: Literal["High", "Medium", "Low"]
    negotiability: Literal["Likely", "Moderate", "Unlikely"]

class NegotiationReport(BaseModel):
    suggestions: List[NegotiationSuggestion]
    strategy_summary: str

# 9. Comparison
class ClauseDiff(BaseModel):
    clause_name: str
    reference: Optional[str] = None
    change_type: Literal["Added", "Removed", "Modified", "Unchanged"]
    original_text: Optional[str] = None
    new_text: Optional[str] = None
    impact: Optional[Literal["Low", "Medium", "High"]] = None

class ComparisonReport(BaseModel):
    diffs: List[ClauseDiff]
    summary: str

# 10. Classification
class ContractClassification(BaseModel):
    contract_type: str
    confidence_notes: str
