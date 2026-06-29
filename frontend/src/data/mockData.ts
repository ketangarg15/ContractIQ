import { Contract } from "../types";

export const mockContracts: Contract[] = [
  {
    id: "meridian-saas",
    name: "Meridian_SaaS_License.pdf",
    counterparty: "Meridian Software",
    type: "SaaS License",
    effectiveDate: "2024-02-14",
    value: "$85,000/yr",
    overallRisk: "Critical",
    score: 91,
    clausesCount: 7,
    status: "Action Required",
    clauses: [
      {
        id: "c1",
        name: "Liability Cap",
        text: "The total liability of either party under this Agreement shall not exceed the greater of (i) the amounts paid by Customer in the three (3) months preceding the claim or (ii) Five Thousand Dollars ($5,000).",
        riskLevel: "Critical",
        confidenceLevel: "High",
        status: "Needs Review",
        score: 94,
        explanation: "The liability cap of $5,000 or 3 months of fees is exceptionally low for an enterprise SaaS contract of this value ($85,000/yr). Standard vendor templates typically set the cap at 12 months of fees.",
        recommendation: "Negotiate to increase the liability cap to at least 12 months of fees paid. Highlight that the current cap is commercially unreasonable for this size deal.",
        suggestedWording: "The total aggregate liability of either party shall not exceed the total fees paid or payable by Customer to Vendor in the twelve (12) month period immediately preceding the event giving rise to the claim.",
        reviewHistory: [
          { id: "h1", user: "ContractIQ AI", action: "Flagged as Critical Risk", date: "2026-06-26 10:02 AM" },
          { id: "h2", user: "Sarah Mitchell", action: "Marked for Legal Review", date: "2026-06-26 10:05 AM" }
        ]
      },
      {
        id: "c2",
        name: "Data Processing",
        text: "Vendor may process, store, and transfer Customer Data globally without restriction for purposes of providing the Services and for Vendor's internal analytics and product improvement.",
        riskLevel: "High",
        confidenceLevel: "High",
        status: "Confirmed",
        score: 76,
        explanation: "Global data transfer without restriction violates standard GDPR and CCPA compliance requirements which mandate specific data localization and safety safeguards."
      },
      {
        id: "c3",
        name: "Auto-Renewal",
        text: "This Agreement will automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least 90 days prior to the end of the current term.",
        riskLevel: "Medium",
        confidenceLevel: "Medium",
        status: "AI-Suggested",
        score: 51,
        explanation: "A 90-day auto-renewal notification window is longer than the standard 30-day or 60-day period. This could lead to unintentional locking into another annual term."
      },
      {
        id: "c4",
        name: "IP Ownership",
        text: "Customer retains all right, title and interest in and to Customer Data. Vendor retains all right, title and interest in and to the Services and any templates generated.",
        riskLevel: "Medium",
        confidenceLevel: "High",
        status: "Confirmed",
        score: 60,
        explanation: "Clause is mostly standard, but the phrase 'and any templates generated' could grant the vendor rights to custom reports created with customer data."
      },
      {
        id: "c5",
        name: "Indemnification",
        text: "Vendor shall defend Customer against any third-party claims alleging that the Service infringes a patent, copyright or trademark, provided Customer gives immediate written notice.",
        riskLevel: "High",
        confidenceLevel: "High",
        status: "Needs Review",
        score: 82,
        explanation: "The requirement for 'immediate' written notice is a high-risk condition. It should be changed to 'prompt' notice, as 'immediate' can easily be breached, nullifying the indemnity."
      },
      {
        id: "c6",
        name: "Governing Law",
        text: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles.",
        riskLevel: "Low",
        confidenceLevel: "High",
        status: "Confirmed",
        score: 98,
        explanation: "Standard governing law clause specifying Delaware jurisdiction. Low risk."
      },
      {
        id: "c7",
        name: "Termination for Convenience",
        text: "Either party may terminate this Agreement at any time with or without cause by giving thirty (30) days prior written notice to the other party.",
        riskLevel: "Low",
        confidenceLevel: "Low",
        status: "AI-Suggested",
        score: 35,
        explanation: "Termination for convenience with 30 days notice is highly favorable, but may present risk to continuous service stability if exercised by the vendor."
      }
    ],
    aiSummary: {
      executiveSummary: "This is a standard enterprise SaaS agreement with Meridian Software for their core analytics platform. The overall risk is High due to an aggressive liability cap and unfavorable data processing terms. The contract value is $85,000/yr with a 1-year auto-renewing term.",
      obligations: [
        { id: "o1", text: "Customer shall pay annual license fee of $85,000 within 30 days of invoice, with a 1.5% monthly late fee." },
        { id: "o2", text: "Customer is responsible for all user access management and must notify Vendor within 48 hours of any known security incident." },
        { id: "o3", text: "Vendor must provide 99.5% uptime and 4-hour response time for Severity 1 incidents per Exhibit B." },
        { id: "o4", text: "Both parties agree to keep all proprietary information confidential for 3 years post-termination." }
      ],
      deadlines: [
        { id: "d1", title: "Annual renewal notice deadline", date: "Dec 15, 2024", isCritical: true },
        { id: "d2", title: "Initial payment due", date: "Mar 15, 2024", isCritical: false },
        { id: "d3", title: "Quarterly usage report", date: "Apr 1, 2024", isCritical: false },
        { id: "d4", title: "Security audit submission", date: "Jun 30, 2024", isCritical: false }
      ],
      financialCommitments: [
        { id: "f1", name: "Annual license fee", value: "$85,000" },
        { id: "f2", name: "Implementation fee (One-time)", value: "$15,000" },
        { id: "f3", name: "Premium Support (Optional)", value: "$10,000/yr" }
      ],
      renewalTerms: [
        "Automatically renews for successive 1-year terms.",
        "Requires 90 days written notice prior to term end to prevent renewal.",
        "Vendor may increase fees by up to 7% per renewal term."
      ],
      terminationConditions: [
        "Termination for cause requires 30 days cure period.",
        "Customer may terminate for convenience with 60 days notice, but fees are non-refundable.",
        "Upon termination, vendor will delete all customer data within 90 days."
      ],
      topRisks: [
        "Liability cap is limited to $5,000 or 3 months fees (commercially unreasonable).",
        "Data processing terms allow global transfer without restrictions, risking GDPR compliance.",
        "90-day auto-renewal notice period is aggressive."
      ],
      recommendedNextSteps: [
        "Send redlines focusing on Section 7 (Liability) and Section 4 (Data Privacy).",
        "Request vendor's DPA (Data Processing Addendum) for GDPR compliance review.",
        "Set a calendar reminder for Oct 15, 2024 to review renewal."
      ]
    },
    comparisons: [
      {
        id: "comp1",
        clauseName: "Liability Cap",
        deviationType: "Major Deviation",
        approvedText: "The aggregate liability of either party shall not exceed the total fees paid or payable in the twelve (12) months preceding the claim.",
        contractText: "The total liability of either party shall not exceed the greater of (i) three months of fees or (ii) Five Thousand Dollars ($5,000)."
      },
      {
        id: "comp2",
        clauseName: "Data Processing",
        deviationType: "Major Deviation",
        approvedText: "Vendor shall process Customer Data solely as necessary to provide the Services. Vendor shall implement appropriate technical and organizational measures.",
        contractText: "Vendor may process, store, and transfer Customer Data globally without restriction for purposes of providing the Services and for Vendor's internal analytics."
      },
      {
        id: "comp3",
        clauseName: "Auto-Renewal Notice",
        deviationType: "Minor Deviation",
        approvedText: "Requires 30 days written notice to prevent auto-renewal.",
        contractText: "Requires 90 days written notice to prevent auto-renewal."
      },
      {
        id: "comp4",
        clauseName: "Governing Law",
        deviationType: "No Deviation",
        approvedText: "Governed by the laws of the State of Delaware.",
        contractText: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware."
      }
    ],
    versionComparisons: [
      {
        id: "vc1",
        clauseName: "§3.1 License Grant",
        status: "Unchanged",
        originalText: "Vendor grants Customer a non-exclusive, non-transferable license to access the Platform for internal business purposes.",
        currentText: "Vendor grants Customer a non-exclusive, non-transferable license to access the Platform for internal business purposes."
      },
      {
        id: "vc2",
        clauseName: "§4.2 Liability Cap",
        status: "Modified",
        originalText: "The total liability of either party shall not exceed the fees paid in the twelve (12) months preceding the claim.",
        currentText: "The total liability of either party under this Agreement shall not exceed the greater of (i) the amounts paid by Customer in the three (3) months preceding the claim or (ii) Five Thousand Dollars ($5,000)."
      },
      {
        id: "vc3",
        clauseName: "§5.1 Data Processing",
        status: "Modified",
        originalText: "Vendor shall process Customer Data solely as necessary to provide the Services.",
        currentText: "Vendor may process, store, and transfer Customer Data globally without restriction for purposes of providing the Services and for Vendor's internal analytics."
      },
      {
        id: "vc4",
        clauseName: "§6.3 Audit Rights",
        status: "Added",
        currentText: "Vendor reserves the right to audit Customer's usage of the Platform at any time with 24 hours notice to ensure compliance with licensing limits."
      },
      {
        id: "vc5",
        clauseName: "§7.2 Termination for Convenience",
        status: "Removed",
        originalText: "Customer may terminate this Agreement for convenience at any time by providing thirty (30) days prior written notice to Vendor."
      }
    ],
    history: [
      { id: "h1", user: "Sarah Mitchell", action: "Uploaded file", date: "2026-06-26 10:00 AM" },
      { id: "h2", user: "ContractIQ AI", action: "Completed risk analysis", date: "2026-06-26 10:02 AM" }
    ]
  },
  {
    id: "nda-apollo",
    name: "NDA_Project_Apollo_v2.pdf",
    counterparty: "Apollo Corp",
    type: "Confidentiality",
    effectiveDate: "2026-06-26",
    value: "N/A",
    overallRisk: "Low",
    score: 96,
    clausesCount: 14,
    status: "Clean",
    clauses: [],
    aiSummary: {
      obligations: [],
      deadlines: [],
      financialCommitments: []
    },
    comparisons: [],
    history: []
  },
  {
    id: "vendor-msa",
    name: "Vendor_MSA_Final_2026.pdf",
    counterparty: "MSA Logistics",
    type: "Service Agreement",
    effectiveDate: "2026-06-25",
    value: "$120,000/yr",
    overallRisk: "Medium",
    score: 74,
    clausesCount: 42,
    status: "Warning",
    clauses: [],
    aiSummary: {
      obligations: [],
      deadlines: [],
      financialCommitments: []
    },
    comparisons: [],
    history: []
  },
  {
    id: "saas-enterprise",
    name: "SaaS_Enterprise_Agreement.pdf",
    counterparty: "Enterprise Corp",
    type: "Subscription",
    effectiveDate: "2026-06-23",
    value: "$45,000/yr",
    overallRisk: "High",
    score: 48,
    clausesCount: 29,
    status: "Action Required",
    clauses: [],
    aiSummary: {
      obligations: [],
      deadlines: [],
      financialCommitments: []
    },
    comparisons: [],
    history: []
  }
];

export const mockDashboardData = {
  contractsReviewed: 47,
  avgRiskScore: 54,
  avgRiskChange: "+3 from last month",
  criticalFlags: 31,
  criticalFlagsContractsCount: 12,
  timeSaved: "186h",
  riskDistribution: [
    { name: "Critical", value: 8, color: "#8b5cf6" }, // Violet
    { name: "High", value: 23, color: "#f97316" }, // Orange
    { name: "Medium", value: 41, color: "#f59e0b" }, // Amber
    { name: "Low", value: 28, color: "#14b8a6" } // Teal
  ],
  agreementRate: [
    { month: "Oct", rate: 70 },
    { month: "Nov", rate: 75 },
    { month: "Dec", rate: 79 },
    { month: "Jan", rate: 84 },
    { month: "Feb", rate: 88 },
    { month: "Mar", rate: 92 }
  ],
  topRiskCategories: [
    { name: "Liability Cap", count: 18, total: 18 },
    { name: "Data Processing", count: 14, total: 18 },
    { name: "IP Ownership", count: 11, total: 18 },
    { name: "Auto-Renewal", count: 9, total: 18 },
    { name: "Indemnification", count: 7, total: 18 }
  ]
};

export const mockSearchResults = [
  {
    id: "sr1",
    contractName: "Meridian SaaS License",
    clauseName: "Liability Cap",
    snippet: "...shall not exceed the greater of (i) amounts paid in three months or (ii) Five Thousand Dollars ($5,000)...",
    tags: ["Liability cap: $5,000"],
    riskLevel: "Critical"
  },
  {
    id: "sr2",
    contractName: "Vertex Vendor Agreement",
    clauseName: "Liability Cap",
    snippet: "...total liability shall not exceed fees paid in the preceding twelve (12) months...",
    tags: ["Liability cap: ~$240,000"],
    riskLevel: "Medium"
  },
  {
    id: "sr3",
    contractName: "Ironwood Procurement",
    clauseName: "Liability Cap",
    snippet: "...total liability shall not exceed Two Million Dollars ($2,000,000)...",
    tags: ["Liability cap: $2M"],
    riskLevel: "Low"
  },
  {
    id: "sr4",
    contractName: "BrightPath Partnership",
    clauseName: "Liability Cap",
    snippet: "...maximum liability shall not exceed Fifty Thousand Dollars ($50,000) per incident...",
    tags: ["Liability cap: $50,000"],
    riskLevel: "High"
  }
];

export const mockSearchResultsAutoRenewal = [
  {
    id: "ar1",
    contractName: "Meridian SaaS License",
    clauseName: "Auto-Renewal",
    snippet: "...will automatically renew for successive one-year terms unless either party provides written notice of non-renewal at least 90 days prior...",
    tags: ["90 days notice", "Auto-renews"],
    riskLevel: "Medium"
  },
  {
    id: "ar2",
    contractName: "Enterprise Corp Subscription",
    clauseName: "Term and Renewal",
    snippet: "...shall automatically renew for additional periods of the same duration as the Initial Term unless either party gives the other notice of non-renewal at least 90 days before...",
    tags: ["90 days notice", "Same duration"],
    riskLevel: "High"
  }
];

export const mockSearchResultsDataTransfer = [
  {
    id: "dt1",
    contractName: "Meridian SaaS License",
    clauseName: "Data Processing",
    snippet: "...Vendor may process, store, and transfer Customer Data globally without restriction for purposes of providing the Services...",
    tags: ["Global transfer", "No restrictions"],
    riskLevel: "High"
  }
];

export const mockSearchResultsIndemnification = [
  {
    id: "in1",
    contractName: "Acme Corp NDA",
    clauseName: "Indemnification (Missing)",
    snippet: "[Analysis] No mutual indemnification clause was found. This leaves both parties exposed to third-party IP infringement claims...",
    tags: ["Missing clause", "High risk"],
    riskLevel: "High"
  },
  {
    id: "in2",
    contractName: "Global Reach NDA",
    clauseName: "Indemnification (Missing)",
    snippet: "[Analysis] The agreement lacks a standard indemnification provision protecting against breach of confidentiality...",
    tags: ["Missing clause", "Medium risk"],
    riskLevel: "Medium"
  }
];

export const mockComplianceRecords: import("../types").ComplianceRecord[] = [
  { id: "cr1", contractId: "meridian-saas", framework: "GDPR", status: "Fail", score: 62, lastChecked: "2026-06-25", issues: ["Global data transfer without restriction", "Missing data deletion SLA"], recommendations: ["Require Data Processing Addendum (DPA)", "Add Standard Contractual Clauses (SCCs)"] },
  { id: "cr2", contractId: "meridian-saas", framework: "CCPA", status: "Warning", score: 78, lastChecked: "2026-06-25", issues: ["Missing 'Do Not Sell My Personal Information' provision"], recommendations: ["Add CCPA-specific addendum"] },
  { id: "cr3", contractId: "meridian-saas", framework: "SOX", status: "Pass", score: 95, lastChecked: "2026-06-25", issues: [], recommendations: [] },
  { id: "cr4", contractId: "nda-apollo", framework: "GDPR", status: "Pass", score: 100, lastChecked: "2026-06-20", issues: [], recommendations: [] },
];

export const mockChatMessages: import("../types").ChatMessage[] = [
  { id: "msg1", role: "user", content: "What is the liability cap in this contract?" },
  { id: "msg2", role: "assistant", content: "The liability cap is set to the greater of (i) three months of fees or (ii) $5,000. This is exceptionally low compared to standard templates, which usually cap liability at 12 months of fees.", citations: ["§4.2 Liability Cap"] },
  { id: "msg3", role: "user", content: "Does this agreement have an auto-renewal clause?" },
];

export const mockNeedsReviewQueue = [
  {
    id: "nr1",
    clauseName: "IP Ownership",
    contractName: "Meridian SaaS License",
    confidence: "Low",
    risk: "High",
    status: "Needs Review",
    score: 69
  },
  {
    id: "nr2",
    clauseName: "Force Majeure Scope",
    contractName: "Ironwood Procurement",
    confidence: "Low",
    risk: "Medium",
    status: "Needs Review",
    score: 43
  },
  {
    id: "nr3",
    clauseName: "Governing Law",
    contractName: "Right Path Partnership",
    confidence: "Low",
    risk: "Medium",
    status: "Needs Review",
    score: 47
  },
  {
    id: "nr4",
    clauseName: "Indemnification — Missing",
    contractName: "Meridian SaaS License",
    confidence: "High",
    risk: "High",
    status: "Needs Review",
    score: 72
  }
];

