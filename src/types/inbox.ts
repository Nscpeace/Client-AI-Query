export type QueryCategory = 
  | 'Technical Incident'
  | 'Billing & Invoicing'
  | 'Account & Contract'
  | 'Feature Request'
  | 'Onboarding & Setup'
  | 'General Inquiry';

export type UrgencyLevel = 'P1 Critical' | 'P2 High' | 'P3 Normal' | 'P4 Low';

export type QueryStatus = 
  | 'new'
  | 'triaged'
  | 'draft_ready'
  | 'approved'
  | 'escalated'
  | 'confidential_routed';

export type ClientTier = 'Enterprise' | 'Growth' | 'Startup';

export interface ClientRecord {
  id: string;
  name: string;
  domain: string;
  tier: ClientTier;
  annualValue: string;
  assignedCSM: string;
  slaResponseHours: number; // e.g. 1 hour for P1, 4 for P2
  renewalDate: string;
  activeContract: string;
  isConfidential: boolean;
  notes: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: QueryCategory;
  sectionCode: string; // e.g. KB-REFUND-§3.2
  summary: string;
  content: string;
  lastUpdated: string;
  tags: string[];
}

export interface GroundedCitation {
  articleId: string;
  sectionCode: string;
  title: string;
  relevantExcerpt: string;
  confidence: number;
}

export type DraftTone = 'empathetic' | 'concise' | 'technical' | 'executive';

export interface DraftReply {
  id: string;
  queryId: string;
  subject: string;
  body: string;
  tone: DraftTone;
  citations: GroundedCitation[];
  confidenceScore: number; // 0 - 100
  generatedAt: string;
  lastEditedAt?: string;
  isApproved: boolean;
  isSavedToGmailDrafts: boolean;
  approvedBy?: string;
}

export interface ClientQuery {
  id: string;
  source: 'gmail_api' | 'simulator';
  threadId?: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  clientCompany: string;
  clientId: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: string;
  slaDeadline: string; // ISO string
  category: QueryCategory;
  urgency: UrgencyLevel;
  sentiment: 'Frustrated' | 'Urgent' | 'Neutral' | 'Inquisitive';
  status: QueryStatus;
  isConfidential: boolean;
  confidentialReason?: string;
  assignedTo: string;
  assignedRole: string;
  aiReasoning?: string;
  draftReply?: DraftReply;
  routingHistory: {
    timestamp: string;
    action: string;
    actor: string;
    note: string;
  }[];
}

export interface ConfidentialRule {
  id: string;
  domainPattern: string;
  clientName: string;
  reason: string;
  action: 'bypass_ai_and_route' | 'sanitize_pii_only';
  assignedLead: string;
  enabled: boolean;
  createdAt: string;
}

export interface WorkflowNode {
  id: string;
  stepNumber: number;
  label: string;
  service: string;
  iconType: string;
  description: string;
  status: 'active' | 'executing' | 'idle' | 'success';
  avgLatencyMs: number;
  successRate: number;
  sampleInput: Record<string, any>;
  sampleOutput: Record<string, any>;
  promptTemplate?: string;
}

export interface TriageAnalytics {
  totalQueriesToday: number;
  p1UrgentCount: number;
  draftsAwaitingApproval: number;
  approvedCount: number;
  confidentialCount: number;
  avgPrepTimeMinutes: number;
  slaCompliancePercentage: number;
  categoryBreakdown: { category: QueryCategory; count: number }[];
  urgencyBreakdown: { level: UrgencyLevel; count: number }[];
}
