import { ClientRecord, KnowledgeArticle, ClientQuery, ConfidentialRule, WorkflowNode } from '../types/inbox';

export const INITIAL_CLIENTS: ClientRecord[] = [
  {
    id: 'client_apex',
    name: 'Apex Global Logistics',
    domain: 'apexlogistics.com',
    tier: 'Enterprise',
    annualValue: '$240,000/yr',
    assignedCSM: 'Sarah Jenkins',
    slaResponseHours: 1, // 1 hour for P1
    renewalDate: '2026-12-15',
    activeContract: 'Enterprise SLA Platinum #AGL-2025-E4',
    isConfidential: false,
    notes: 'Key enterprise logistics customer. Uses European multi-region webhook ingest. High sensitivity to latency.',
  },
  {
    id: 'client_fintech',
    name: 'NovaPay Financial Services',
    domain: 'novapay.io',
    tier: 'Enterprise',
    annualValue: '$180,000/yr',
    assignedCSM: 'Marcus Vance',
    slaResponseHours: 1,
    renewalDate: '2026-11-01',
    activeContract: 'FinTech Compliance Master Agreement #NV-9921',
    isConfidential: true,
    notes: 'Regulated banking partner. Strict data privacy clause: do not run automated unmonitored scripts against raw customer account numbers.',
  },
  {
    id: 'client_strata',
    name: 'Strata Cloud Solutions',
    domain: 'stratacloud.tech',
    tier: 'Growth',
    annualValue: '$48,000/yr',
    assignedCSM: 'Elena Rostova',
    slaResponseHours: 4,
    renewalDate: '2027-02-28',
    activeContract: 'Growth Tier Subscription #SCS-881',
    isConfidential: false,
    notes: 'Fast-scaling SaaS platform. Recently migrated to v2 webhook API.',
  },
  {
    id: 'client_biotech',
    name: 'Helix Genomics Labs',
    domain: 'helixlabs.org',
    tier: 'Enterprise',
    annualValue: '$310,000/yr',
    assignedCSM: 'Sarah Jenkins',
    slaResponseHours: 1,
    renewalDate: '2027-04-10',
    activeContract: 'BioTech Enterprise Agreement #HL-2024-X',
    isConfidential: true,
    notes: 'Confidential clinical trials genomics client. Internal NDA strictly prohibits transmitting raw sequencing identifier emails outside human leads.',
  },
  {
    id: 'client_vector',
    name: 'Vector Dynamics AI',
    domain: 'vectordynamics.ai',
    tier: 'Startup',
    annualValue: '$18,000/yr',
    assignedCSM: 'Elena Rostova',
    slaResponseHours: 8,
    renewalDate: '2026-12-01',
    activeContract: 'Standard Startup License #VEC-109',
    isConfidential: false,
    notes: 'Developer team building batch embeddings. Inquires often regarding API rate limits and tier upgrades.',
  },
  {
    id: 'client_global',
    name: 'Global Retail Corp',
    domain: 'globalretail.com',
    tier: 'Enterprise',
    annualValue: '$380,000/yr',
    assignedCSM: 'Sarah Jenkins',
    slaResponseHours: 1,
    renewalDate: '2026-11-30',
    activeContract: 'Global Tier 1 Omnichannel Master Agreement #GRC-2025',
    isConfidential: false,
    notes: 'Major global omnichannel retailer. Strict contract penalty clauses for unhandled billing disputes over 14 days.',
  },
  {
    id: 'client_matrix',
    name: 'CloudMatrix IO',
    domain: 'cloudmatrix.io',
    tier: 'Enterprise',
    annualValue: '$210,000/yr',
    assignedCSM: 'Sarah Jenkins',
    slaResponseHours: 1,
    renewalDate: '2027-01-15',
    activeContract: 'Enterprise Cloud Ingress Agreement #CMX-8802',
    isConfidential: false,
    notes: 'Core infrastructure customer with high-throughput database read replicas.',
  },
];

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: 'kb_refund',
    title: 'Billing Discrepancies & Credit Policy',
    category: 'Billing & Invoicing',
    sectionCode: 'KB-BILLING-§3.2',
    summary: 'Standard terms for prorated credit adjustments, invoice grace periods, and dispute review windows.',
    content: `All invoice queries regarding prorated credits or billing anomalies must be reviewed within 2 business days.
Under §3.2 of the Master Terms of Service:
- If service interruption exceeds SLA commitment for > 30 minutes, enterprise accounts qualify for a 5% credit on the monthly billing cycle upon verified log submission.
- Duplicate charges or card authorization errors are refunded immediately via Stripe/Adyen gateway within 3–5 business banking days.
- Growth and Startup tier cancellations must be notified 14 days prior to the billing cycle rollover date.`,
    lastUpdated: '2026-09-12',
    tags: ['billing', 'refund', 'credit', 'invoice', 'p1_credit'],
  },
  {
    id: 'kb_webhook_failover',
    title: 'Webhook Retries & European Cluster Runbook',
    category: 'Technical Incident',
    sectionCode: 'KB-INCIDENT-§7.1',
    summary: 'Emergency mitigation protocol when client dispatch queues report 504 timeouts or drop payloads.',
    content: `When a client experiences HTTP 504 gateway timeouts or webhook delivery failures:
1. Verify status at status.acmecloud.io.
2. Webhooks retry with exponential backoff: 30s, 2m, 10m, 1h, up to 72 hours. No payloads are permanently dropped during cluster failovers.
3. If the EU-West endpoint is experiencing latency, customers can enable automatic secondary route failover in Settings -> Webhooks -> Redundant Failover Gateway.
4. For P1 outages affecting core production traffic, dispatch on-call engineer (pagerduty-core-infra) immediately.`,
    lastUpdated: '2026-10-01',
    tags: ['webhook', 'timeout', '504', 'incident', 'failover', 'p1'],
  },
  {
    id: 'kb_rate_limits',
    title: 'API Rate Limits, Burst Caps & Scaling Upgrades',
    category: 'Technical Incident',
    sectionCode: 'KB-TECH-§4.4',
    summary: 'Tier-by-tier quota thresholds, 429 response handling, and custom concurrency unlocks.',
    content: `Standard Quota Guidelines:
- Startup Tier: 60 requests/minute, burst pool 120.
- Growth Tier: 300 requests/minute, burst pool 600.
- Enterprise Tier: 2,500 requests/minute with custom dedicated IP ingress and unlimited burst pooling.
When clients hit HTTP 429 Too Many Requests, headers return X-RateLimit-Reset-In-Seconds. If their volume is legitimate business growth, CSMs can grant a temporary 7-day 2x burst multiplier pending subscription renewal.`,
    lastUpdated: '2026-08-15',
    tags: ['rate_limit', 'api', '429', 'quota', 'burst'],
  },
  {
    id: 'kb_sla_commitments',
    title: 'Enterprise Service Level Agreements (SLA Matrix)',
    category: 'Account & Contract',
    sectionCode: 'KB-SLA-§1.1',
    summary: 'Defined response times, target resolution windows, and penalty guidelines across contract tiers.',
    content: `SLA Matrix by Severity:
- P1 Critical (Complete outage, data pipeline halt): 60-minute initial response by Senior Engineer. 4-hour target workaround.
- P2 High (Degraded performance, major feature impaired): 4-hour initial response. 24-hour target resolution.
- P3 Normal (Routine technical questions, minor bugs): 1 business day response.
- P4 Low (Feature suggestions, cosmetic updates): 2 business days response.
Enterprise accounts feature dedicated telephone bridge escalation and direct Slack Connect channel access.`,
    lastUpdated: '2026-09-20',
    tags: ['sla', 'enterprise', 'response_time', 'escalation'],
  },
  {
    id: 'kb_confidential_protocol',
    title: 'Confidential Client Data Handling & Exclusion Protocol',
    category: 'General Inquiry',
    sectionCode: 'KB-SECURITY-§9.0',
    summary: 'Mandatory guardrail: strict human triage for accounts with NDA or regulated compliance mandates.',
    content: `Under ISO 27001 and SOC 2 Type II compliance controls:
- Any incoming message from an organization flagged on the Confidential Accounts Registry must be excluded from third-party AI processing.
- The ticket is immediately assigned to the designated Account Director or Senior Solutions Lead.
- Internal communication regarding confidential queries must use ticket identifier codes rather than client patient/financial details.`,
    lastUpdated: '2026-10-10',
    tags: ['compliance', 'confidential', 'nda', 'security', 'iso27001'],
  },
];

export const INITIAL_CONFIDENTIAL_RULES: ConfidentialRule[] = [
  {
    id: 'crule_1',
    domainPattern: 'novapay.io',
    clientName: 'NovaPay Financial Services',
    reason: 'Regulated banking entity with PCI-DSS strict compliance restrictions.',
    action: 'bypass_ai_and_route',
    assignedLead: 'Marcus Vance (Senior FinTech Director)',
    enabled: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'crule_2',
    domainPattern: 'helixlabs.org',
    clientName: 'Helix Genomics Labs',
    reason: 'Clinical research patient data and proprietary biotech sequencing NDA.',
    action: 'bypass_ai_and_route',
    assignedLead: 'Sarah Jenkins (Enterprise Lead)',
    enabled: true,
    createdAt: '2026-02-01',
  },
  {
    id: 'crule_3',
    domainPattern: '*.defense-contractor.com',
    clientName: 'National Defense Contractors',
    reason: 'ITAR / FedRAMP high sovereignty mandate.',
    action: 'bypass_ai_and_route',
    assignedLead: 'Executive On-Call Lead',
    enabled: true,
    createdAt: '2026-03-10',
  },
];

const now = Date.now();
export const minutesAgo = (m: number) => new Date(now - m * 60 * 1000).toISOString();
export const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
export const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();
export const minutesFromNow = (m: number) => new Date(now + m * 60 * 1000).toISOString();
export const hoursFromNow = (h: number) => new Date(now + h * 60 * 60 * 1000).toISOString();

export const SAMPLE_QUERIES: ClientQuery[] = [
  {
    id: 'query_1',
    source: 'simulator',
    threadId: 'th_apex_01',
    senderName: 'David Chen',
    senderEmail: 'dchen@apexlogistics.com',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    clientCompany: 'Apex Global Logistics',
    clientId: 'client_apex',
    subject: 'URGENT: European webhook endpoint throwing 504 timeouts on dispatch queue',
    snippet: 'Since 08:30 UTC our dispatch automation has received consecutive 504 gateway timeouts on the EU-West webhook cluster...',
    body: `Hi Acme Cloud Support Team,

This is David from Apex Logistics. Since 08:30 UTC our dispatch automation has received consecutive 504 gateway timeouts on the EU-West webhook cluster (endpoint /v2/events/dispatch). 

Over 1,400 shipment notices are currently queued in our retry buffer and drivers cannot receive manifest confirmation. As an Enterprise SLA Platinum account, we need immediate confirmation of the issue and estimated resolution time. Are retries dropping any events, or is our buffer safe?

Please respond urgently.

Best regards,
David Chen
VP of Platform Engineering
Apex Global Logistics`,
    receivedAt: minutesAgo(25),
    slaDeadline: minutesFromNow(35), // Active P1: 35 minutes left
    category: 'Technical Incident',
    urgency: 'P1 Critical',
    sentiment: 'Urgent',
    status: 'draft_ready',
    isConfidential: false,
    assignedTo: 'Sarah Jenkins',
    assignedRole: 'Senior Solutions Engineer',
    aiReasoning: 'Critical customer infrastructure outage affecting live shipping operations. Explicit mention of 504 timeouts on EU-West cluster with 1,400 queued manifests. Enterprise Platinum SLA requires 60-minute response. Matched with KB-INCIDENT-§7.1 regarding automatic exponential retry buffering.',
    draftReply: {
      id: 'draft_1',
      queryId: 'query_1',
      subject: 'Re: URGENT: European webhook endpoint throwing 504 timeouts on dispatch queue',
      tone: 'technical',
      confidenceScore: 96,
      generatedAt: '2026-10-19T02:37:15-07:00',
      isApproved: false,
      isSavedToGmailDrafts: false,
      citations: [
        {
          articleId: 'kb_webhook_failover',
          sectionCode: 'KB-INCIDENT-§7.1',
          title: 'Webhook Retries & European Cluster Runbook',
          relevantExcerpt: 'Webhooks retry with exponential backoff: 30s, 2m, 10m, 1h, up to 72 hours. No payloads are permanently dropped during cluster failovers.',
          confidence: 98,
        },
        {
          articleId: 'kb_sla_commitments',
          sectionCode: 'KB-SLA-§1.1',
          title: 'Enterprise Service Level Agreements (SLA Matrix)',
          relevantExcerpt: 'P1 Critical (Complete outage, data pipeline halt): 60-minute initial response by Senior Engineer.',
          confidence: 94,
        },
      ],
      body: `Hi David,

Thank you for reaching out, and we recognize the critical nature of this dispatch disruption for Apex Logistics.

Our core infrastructure on-call team is already investigating the elevated 504 gateway timeout rates on the EU-West webhook cluster. 

To address your immediate concern regarding event safety: under our webhook delivery architecture (referenced in Runbook KB-INCIDENT-§7.1), all unacknowledged dispatch notifications are preserved in our durable Kafka buffer and will automatically retry with exponential backoff for up to 72 hours. No shipment event payloads are being dropped.

Temporary Mitigation:
If you need immediate relief while the European cluster pod scaling finishes, you can toggle our Redundant Failover Gateway in your Apex dashboard (Settings -> Webhooks -> Redundant Failover Gateway) to route incoming payloads across our Frankfurt backup instance.

We will provide our next operational status update within 30 minutes, or as soon as latency metrics stabilize below 80ms.

Sincerely,
Sarah Jenkins
Enterprise Solutions & Support Engineering`,
    },
    routingHistory: [
      {
        timestamp: '2026-10-19T02:35:10-07:00',
        action: 'Ingested via Gmail Webhook',
        actor: 'Inbox Ingestion Engine',
        note: 'New email detected in support@acmecloud.io shared inbox',
      },
      {
        timestamp: '2026-10-19T02:35:18-07:00',
        action: 'AI Classification & Enrichment',
        actor: 'Gemini Triage Model',
        note: 'Assigned P1 Critical based on Enterprise SLA & active dispatch outage keywords.',
      },
      {
        timestamp: '2026-10-19T02:37:15-07:00',
        action: 'Draft Generated',
        actor: 'Draft Synthesis Engine',
        note: 'Draft staged with citations to KB-INCIDENT-§7.1 and KB-SLA-§1.1. Auto-send disabled.',
      },
    ],
  },
  {
    id: 'query_2',
    source: 'simulator',
    threadId: 'th_strata_02',
    senderName: 'Rachel Green',
    senderEmail: 'rachel@stratacloud.tech',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
    clientCompany: 'Strata Cloud Solutions',
    clientId: 'client_strata',
    subject: 'Discrepancy on September Invoice #INV-2026-0902 & Prorated Credit Request',
    snippet: 'Hi, we noticed an unexpected $680 charge on our September invoice for additional concurrent workers...',
    body: `Hi Support,

We received invoice #INV-2026-0902 this morning and noticed a line item for $680 for additional concurrent workers. According to our Growth Tier plan agreed in February, we were supposed to receive 2 bonus worker slots through Q3 as part of our promotion.

Could you please review this invoice and issue a prorated credit before our accounting team executes the automatic wire transfer on Friday?

Thanks,
Rachel Green
Finance & Operations
Strata Cloud Solutions`,
    receivedAt: daysAgo(9),
    slaDeadline: daysAgo(8), // Overdue by 8 days
    category: 'Billing & Invoicing',
    urgency: 'P2 High',
    sentiment: 'Inquisitive',
    status: 'draft_ready',
    isConfidential: false,
    assignedTo: 'Elena Rostova',
    assignedRole: 'Billing Operations Specialist',
    aiReasoning: 'Invoice dispute regarding bonus worker slots. Customer requests prorated credit before upcoming automatic payment on Friday. Grounded with KB-BILLING-§3.2 credit adjustment rules.',
    draftReply: {
      id: 'draft_2',
      queryId: 'query_2',
      subject: 'Re: Discrepancy on September Invoice #INV-2026-0902 & Prorated Credit Request',
      tone: 'empathetic',
      confidenceScore: 92,
      generatedAt: daysAgo(8),
      isApproved: false,
      isSavedToGmailDrafts: false,
      citations: [
        {
          articleId: 'kb_refund',
          sectionCode: 'KB-BILLING-§3.2',
          title: 'Billing Discrepancies & Credit Policy',
          relevantExcerpt: 'All invoice queries regarding prorated credits or billing anomalies must be reviewed within 2 business days.',
          confidence: 96,
        },
      ],
      body: `Hi Rachel,

Thank you for flagging this with us so quickly!

I have pulled up Strata Cloud Solutions' account and verified your Growth Tier agreement from February. You are completely right—the promotional credit for the 2 bonus worker slots was accidentally omitted by our automated billing rollover system during the September run.

Here is the resolution:
1. I have placed an immediate 5-day payment freeze on invoice #INV-2026-0902 to prevent any automatic wire transfer from executing with the incorrect total.
2. Our finance lead is issuing a revised invoice with the $680 credit adjustment applied, which will be posted to your billing dashboard shortly.

You do not need to take any action; you will receive a notification once the updated invoice is ready.

Best regards,
Elena Rostova
Customer Operations & Billing`,
    },
    routingHistory: [
      {
        timestamp: daysAgo(9),
        action: 'Ingested via Gmail Webhook',
        actor: 'Inbox Ingestion Engine',
        note: 'Classified as Billing & Invoicing, routed to Billing Operations Specialist.',
      },
      {
        timestamp: daysAgo(8),
        action: 'SLA Breach Warning',
        actor: 'SLA Watchdog Daemon',
        note: '4-hour SLA window passed. Ticket flagged as Overdue (currently 8 days overdue).',
      },
    ],
  },
  {
    id: 'query_3',
    source: 'simulator',
    threadId: 'th_helix_03',
    senderName: 'Dr. Aris Thorne',
    senderEmail: 'athorne@helixlabs.org',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    clientCompany: 'Helix Genomics Labs',
    clientId: 'client_biotech',
    subject: 'CONFIDENTIAL: Genomic trial data cohort sequencing API schema query',
    snippet: 'This message contains protected protocol details under Project Prometheus. We are updating our sequencing pipeline...',
    body: `CONFIDENTIAL AND PRIVILEGED COMMUNICATION
Under Master Clinical Research NDA #HL-2024-X

To the Acme Enterprise Support Lead,

We are initiating Cohort 4 data ingestion for our clinical trial (Project Prometheus). As agreed under our compliance addendum, this communication involves proprietary sample sequencing schema references. 

We need your Solutions Lead to review our custom encryption payload structure before we transmit data into the staging environment tomorrow at 14:00 EST. 

Please confirm this request has bypassed automated AI ingestion tools in compliance with Section 4 of our Security Annex, and have Sarah Jenkins contact me directly via our encrypted channel.

Dr. Aris Thorne
Chief Scientific Officer
Helix Genomics Labs`,
    receivedAt: daysAgo(16),
    slaDeadline: daysAgo(14), // Overdue by 2 weeks (14 days)
    category: 'Account & Contract',
    urgency: 'P1 Critical',
    sentiment: 'Urgent',
    status: 'confidential_routed',
    isConfidential: true,
    confidentialReason: 'Matched domain rule for "helixlabs.org" (Clinical research patient data & NDA protection). External AI processing was automatically blocked.',
    assignedTo: 'Sarah Jenkins',
    assignedRole: 'Enterprise Lead (Human-Only Triage)',
    aiReasoning: 'Bypassed external LLM processing per Confidential Accounts Policy KB-SECURITY-§9.0. Directly routed to dedicated Enterprise Lead for encrypted channel follow-up.',
    draftReply: {
      id: 'draft_3',
      queryId: 'query_3',
      subject: 'Re: CONFIDENTIAL: Genomic trial data cohort sequencing API schema query',
      tone: 'executive',
      confidenceScore: 100,
      generatedAt: daysAgo(15),
      isApproved: true,
      isSavedToGmailDrafts: false,
      citations: [
        {
          articleId: 'kb_confidential_protocol',
          sectionCode: 'KB-SECURITY-§9.0',
          title: 'Confidential Client Data Handling & Exclusion Protocol',
          relevantExcerpt: 'Any incoming message from an organization flagged on the Confidential Accounts Registry must be excluded from third-party AI processing. The ticket is immediately assigned to the designated Account Director.',
          confidence: 100,
        },
      ],
      body: `Dear Dr. Thorne,

This is a direct, human-verified confirmation from Sarah Jenkins at Acme Cloud.

In strict compliance with Section 4 of our Security Annex and our Master Clinical Research Agreement (#HL-2024-X), your message has bypassed all automated external AI models and was routed directly to my secure terminal.

I have scheduled our encrypted session for today at 11:00 AM EST to review your custom encryption payload and staging configuration ahead of tomorrow's 14:00 EST Cohort 4 ingestion.

I look forward to speaking with you shortly on our private Keybase bridge.

Respectfully,
Sarah Jenkins
Enterprise Account Director & Lead Architect`,
    },
    routingHistory: [
      {
        timestamp: daysAgo(16),
        action: 'Confidential Policy Triggered',
        actor: 'Security Guardrail Gateway',
        note: 'Domain helixlabs.org identified. Automated AI parsing prohibited. Routed to Sarah Jenkins.',
      },
      {
        timestamp: daysAgo(14),
        action: 'Escalation Alert',
        actor: 'Executive Dispatcher',
        note: '2-week aged query detected without recorded client confirmation.',
      },
    ],
  },
  {
    id: 'query_4',
    source: 'simulator',
    threadId: 'th_vector_04',
    senderName: 'Liam Sato',
    senderEmail: 'liam@vectordynamics.ai',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
    clientCompany: 'Vector Dynamics AI',
    clientId: 'client_vector',
    subject: 'Rate limit 429 errors during nightly batch embedding generations',
    snippet: 'Hi team, our nightly cron job processing vector embeddings keeps tripping HTTP 429 Too Many Requests...',
    body: `Hello Support,

Our nightly batch pipeline that indexes vector embeddings tripped HTTP 429 errors around 02:00 AM PST. We are currently on the Startup license (60 requests/min). 

We have an investor demo next Tuesday and need to know:
1. What is the quickest way to bump our burst pool so our jobs complete without failing?
2. How does the upgrade to Growth Tier work, and can it be activated mid-month?

Thanks for your guidance!

Liam Sato
Co-Founder & CTO
Vector Dynamics AI`,
    receivedAt: daysAgo(4),
    slaDeadline: daysAgo(3), // Overdue by 3 days
    category: 'Technical Incident',
    urgency: 'P3 Normal',
    sentiment: 'Inquisitive',
    status: 'draft_ready',
    isConfidential: false,
    assignedTo: 'Elena Rostova',
    assignedRole: 'Technical Account Specialist',
    aiReasoning: 'Customer encountering 429 rate limits on Startup tier prior to upcoming investor demo. High likelihood of tier upgrade. Grounded in KB-TECH-§4.4 regarding 7-day temporary burst multipliers.',
    draftReply: {
      id: 'draft_4',
      queryId: 'query_4',
      subject: 'Re: Rate limit 429 errors during nightly batch embedding generations',
      tone: 'technical',
      confidenceScore: 94,
      generatedAt: daysAgo(4),
      isApproved: false,
      isSavedToGmailDrafts: false,
      citations: [
        {
          articleId: 'kb_rate_limits',
          sectionCode: 'KB-TECH-§4.4',
          title: 'API Rate Limits, Burst Caps & Scaling Upgrades',
          relevantExcerpt: 'CSMs can grant a temporary 7-day 2x burst multiplier pending subscription renewal.',
          confidence: 97,
        },
      ],
      body: `Hi Liam,

Excited to hear about your upcoming investor demo next Tuesday!

To make sure your batch embeddings run smoothly tonight without interruption, I have activated a complimentary 7-day 2x Burst Multiplier on your account (referencing policy KB-TECH-§4.4). This immediately raises your limit from 60 req/min to 120 req/min with a burst buffer of 240, which should comfortably accommodate your current job volume.

Regarding your upgrade to Growth Tier (300 req/min):
- Yes, upgrades can be completed mid-cycle with prorated billing applied only for the remaining days of October.
- You can activate this with one click in your billing console under Plan & Add-ons, or let me know and I can provision it for you directly.

Good luck with the demo preparations, and let us know if you see any further 429 warnings tonight!

Best regards,
Elena Rostova
Developer Success Team`,
    },
    routingHistory: [
      {
        timestamp: daysAgo(4),
        action: 'Ingested via Simulator',
        actor: 'Inbox Ingestion Engine',
        note: 'Classified P3 Normal. Temporary multiplier recommended.',
      },
      {
        timestamp: daysAgo(3),
        action: 'SLA Elapsed',
        actor: 'System Watcher',
        note: 'Overdue by 3 days. Awaiting team member sign-off.',
      },
    ],
  },
  {
    id: 'query_5',
    source: 'simulator',
    threadId: 'th_fintech_05',
    senderName: 'Kavita Patel',
    senderEmail: 'kavita.patel@novapay.io',
    senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
    clientCompany: 'NovaPay Financial Services',
    clientId: 'client_fintech',
    subject: 'Request for custom audit log export API & PCI retention certificate',
    snippet: 'Hi, our internal audit committee requires an automated raw JSON export of all authorization audit logs...',
    body: `Hello Team,

For our upcoming annual SOC 2 and PCI-DSS audit, NovaPay requires an automated daily JSON export of all API authorization logs spanning July 1 to September 30.

Does Acme Cloud support S3 bucket streaming for audit trails, or is the REST export API the recommended route? Also, please attach your 2026 SOC 2 Type II attestation letter.

Regards,
Kavita Patel
Lead Compliance Officer
NovaPay Financial Services`,
    receivedAt: hoursAgo(5),
    slaDeadline: hoursAgo(4), // Overdue by 4 hours
    category: 'Account & Contract',
    urgency: 'P2 High',
    sentiment: 'Neutral',
    status: 'confidential_routed',
    isConfidential: true,
    confidentialReason: 'Matched domain rule for "novapay.io" (Regulated banking partner compliance). Direct human routing enforced.',
    assignedTo: 'Marcus Vance',
    assignedRole: 'Senior FinTech Director',
    aiReasoning: 'Regulated compliance inquiry. Flagged under Confidential Client Rule. Routed to Marcus Vance with direct access to signed audit attestations.',
    routingHistory: [
      {
        timestamp: hoursAgo(5),
        action: 'Confidential Rule Enforced',
        actor: 'Security Guardrail Gateway',
        note: 'Domain novapay.io detected. Bypassed external AI processing.',
      },
      {
        timestamp: hoursAgo(4),
        action: 'Overdue Reminder',
        actor: 'Alert Daemon',
        note: '4-hour SLA window exceeded by 4h. Marcus Vance alerted on Slack.',
      },
    ],
  },
  {
    id: 'query_6',
    source: 'simulator',
    threadId: 'th_global_06',
    senderName: 'Robert Vance Jr.',
    senderEmail: 'rvance@globalretail.com',
    senderAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80',
    clientCompany: 'Global Retail Corp',
    clientId: 'client_global',
    subject: 'OVERDUE NOTICE: SLA Failure penalty credit calculation & Tier 1 renewal addendum',
    snippet: 'We have not received any response to our formal inquiry submitted over two weeks ago regarding our $4,200 SLA outage credit...',
    body: `To Acme Cloud Executive Operations & Account Management,

This is our second formal notice. We submitted our SLA failure penalty credit calculation over two weeks ago following the multi-region disruption on September 14. Under Section 8.4 of our Tier 1 Omnichannel Master Agreement (#GRC-2025), failure to credit verified outage periods within 14 business days triggers our contract renegotiation clause.

Our annual renewal ($380,000/yr) is scheduled for next month. Please have Sarah Jenkins or your VP of Customer Success review the attached log and credit our ledger immediately.

Robert Vance Jr.
Chief Procurement & Operations Officer
Global Retail Corp`,
    receivedAt: daysAgo(17),
    slaDeadline: daysAgo(14), // Overdue by 2 weeks (14 days)
    category: 'Billing & Invoicing',
    urgency: 'P1 Critical',
    sentiment: 'Frustrated',
    status: 'draft_ready',
    isConfidential: false,
    assignedTo: 'Sarah Jenkins',
    assignedRole: 'Enterprise CSM & Account Director',
    aiReasoning: 'Critical contract renewal at risk ($380,000/yr). Query has sat unresolved for over 2 weeks. Client cites Section 8.4 contract renegotiation clause. Grounded with KB-BILLING-§3.2 and KB-SLA-§1.1.',
    draftReply: {
      id: 'draft_6',
      queryId: 'query_6',
      subject: 'Re: OVERDUE NOTICE: SLA Failure penalty credit calculation & Tier 1 renewal addendum',
      tone: 'executive',
      confidenceScore: 98,
      generatedAt: daysAgo(14),
      isApproved: false,
      isSavedToGmailDrafts: false,
      citations: [
        {
          articleId: 'kb_refund',
          sectionCode: 'KB-BILLING-§3.2',
          title: 'Billing Discrepancies & Credit Policy',
          relevantExcerpt: 'If service interruption exceeds SLA commitment for > 30 minutes, enterprise accounts qualify for a 5% credit on the monthly billing cycle upon verified log submission.',
          confidence: 99,
        },
        {
          articleId: 'kb_sla_commitments',
          sectionCode: 'KB-SLA-§1.1',
          title: 'Enterprise Service Level Agreements (SLA Matrix)',
          relevantExcerpt: 'Enterprise accounts feature dedicated telephone bridge escalation and direct Slack Connect channel access.',
          confidence: 95,
        },
      ],
      body: `Dear Mr. Vance,

First and foremost, I offer my sincere personal apologies for the unacceptable delay in reviewing Global Retail Corp's credit calculation. This ticket fell through an escalation routing gap during our recent team reorganization, and I am personally taking ownership to make this right today.

I have thoroughly reviewed your incident logs from the September 14 disruption alongside Section 8.4 of your agreement and policy KB-BILLING-§3.2:
1. I have authorized and applied a $4,200 SLA outage credit directly to your ledger, effective immediately.
2. In addition, as a demonstration of our partnership commitment ahead of next month's renewal, I have applied a 10% goodwill courtesy discount to your upcoming Q4 billing cycle.
3. Your revised statement and confirmation certificate have been posted to your finance portal.

I would welcome the opportunity to connect via private phone bridge this afternoon to answer any questions and review your upcoming renewal addendum.

Respectfully,
Sarah Jenkins
Enterprise Account Director & Lead Partner Manager`,
    },
    routingHistory: [
      {
        timestamp: daysAgo(17),
        action: 'Inbound Ingest',
        actor: 'Inbox Ingestion Engine',
        note: 'Email received from globalretail.com.',
      },
      {
        timestamp: daysAgo(14),
        action: 'Critical SLA Breach',
        actor: 'SLA Watchdog Daemon',
        note: 'Ticket overdue by 2 weeks. High churn risk flagged.',
      },
    ],
  },
  {
    id: 'query_7',
    source: 'simulator',
    threadId: 'th_matrix_07',
    senderName: 'Tariq Al-Mansoor',
    senderEmail: 'tariq@cloudmatrix.io',
    senderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&h=120&q=80',
    clientCompany: 'CloudMatrix IO',
    clientId: 'client_matrix',
    subject: 'CRITICAL: Database replica replication lag exceeding 185s on cluster',
    snippet: 'Our analytics reporting cluster is serving stale data as replica-eu-02 replication lag has spiked above 185 seconds...',
    body: `Urgent Engineering Team,

Replication lag between primary DB and replica-eu-02 has degraded to 185 seconds (our SLA cap is 5 seconds). Real-time inventory dashboards for our European enterprise customers are serving stale inventory allocations.

We attempted restart of read-replica-pool-2 without improvement. Need senior database engineering support on-call to inspect WAL log sync immediately.

Tariq Al-Mansoor
Director of Infrastructure & SRE
CloudMatrix IO`,
    receivedAt: minutesAgo(40),
    slaDeadline: minutesFromNow(20), // Active P1: 20 minutes left!
    category: 'Technical Incident',
    urgency: 'P1 Critical',
    sentiment: 'Urgent',
    status: 'draft_ready',
    isConfidential: false,
    assignedTo: 'Sarah Jenkins',
    assignedRole: 'Senior Solutions Engineer',
    aiReasoning: 'Database replication lag exceeding 185s on production cluster. Enterprise customer serving stale data to European clients. 20 minutes left before 60-minute SLA commitment breach. Grounded with KB-INCIDENT-§7.1.',
    draftReply: {
      id: 'draft_7',
      queryId: 'query_7',
      subject: 'Re: CRITICAL: Database replica replication lag exceeding 185s on cluster',
      tone: 'technical',
      confidenceScore: 97,
      generatedAt: minutesAgo(35),
      isApproved: false,
      isSavedToGmailDrafts: false,
      citations: [
        {
          articleId: 'kb_webhook_failover',
          sectionCode: 'KB-INCIDENT-§7.1',
          title: 'Webhook Retries & European Cluster Runbook',
          relevantExcerpt: 'For P1 outages affecting core production traffic, dispatch on-call engineer (pagerduty-core-infra) immediately.',
          confidence: 96,
        },
      ],
      body: `Hi Tariq,

Our database infrastructure leads are actively investigating the replication lag on replica-eu-02.

We have identified a network saturation spike on the cross-region WAL shipping bridge connecting Ireland and Frankfurt. 

Mitigation Actions Underway:
1. We have routed all read-only traffic temporarily to our warm standby replica replica-eu-03, where replication lag is nominal at 0.8s.
2. The WAL streaming queue on replica-eu-02 is being drained over an isolated high-bandwidth backbone tunnel and is expected to catch up within 12 minutes.

Your customer dashboards should already reflect fresh data via replica-eu-03. We will provide our next status confirmation in 15 minutes.

Best regards,
Sarah Jenkins
Enterprise Solutions & Database Infrastructure`,
    },
    routingHistory: [
      {
        timestamp: minutesAgo(40),
        action: 'P1 Inbound Detection',
        actor: 'Inbox Ingestion Engine',
        note: 'Incoming critical DB lag query. Assigned P1 Critical.',
      },
    ],
  },
];

export const WORKFLOW_NODES: WorkflowNode[] = [
  {
    id: 'wf_1',
    stepNumber: 1,
    label: 'Inbound Email Ingestion',
    service: 'Gmail API / Webhook Trigger',
    iconType: 'Mail',
    description: 'Polls shared inbox via Pub/Sub webhook or REST query. Parses headers, sender domain, SPF/DKIM verification, and raw thread content.',
    status: 'active',
    avgLatencyMs: 140,
    successRate: 99.8,
    sampleInput: {
      inbox: 'support@acmecloud.io',
      messageId: 'msg_9842a',
      threadId: 'th_apex_01',
      from: 'dchen@apexlogistics.com',
      subject: 'URGENT: European webhook endpoint throwing 504 timeouts',
    },
    sampleOutput: {
      sanitizedText: 'Since 08:30 UTC our dispatch automation has received consecutive 504 gateway timeouts...',
      domain: 'apexlogistics.com',
      hasAttachments: false,
      timestamp: '2026-10-19T02:35:00Z',
    },
  },
  {
    id: 'wf_2',
    stepNumber: 2,
    label: 'Confidentiality & Security Filter',
    service: 'Internal Policy Guardrail Engine',
    iconType: 'ShieldCheck',
    description: 'Compares sender domain and subject keywords against the Confidential Clients Registry. Bypasses external AI for sensitive accounts under NDA.',
    status: 'active',
    avgLatencyMs: 25,
    successRate: 100.0,
    sampleInput: {
      domain: 'apexlogistics.com',
      registryCheck: true,
    },
    sampleOutput: {
      isConfidential: false,
      routingPath: 'AI_ENABLED_PIPELINE',
      policyApplied: 'Standard Enterprise Processing',
    },
  },
  {
    id: 'wf_3',
    stepNumber: 3,
    label: 'Client Profile & KB Context Retrieval',
    service: 'CRM & Knowledge Base Vector Index',
    iconType: 'Database',
    description: 'Enriches query with client contract details (ARR, SLA tier, assigned CSM) and retrieves relevant runbooks, billing policies, and API limits.',
    status: 'active',
    avgLatencyMs: 85,
    successRate: 99.4,
    sampleInput: {
      clientId: 'client_apex',
      semanticQuery: 'European webhook 504 gateway timeouts dispatch queue',
    },
    sampleOutput: {
      client: {
        tier: 'Enterprise Platinum',
        arr: '$240,000/yr',
        slaP1Minutes: 60,
        csm: 'Sarah Jenkins',
      },
      topKnowledgeArticles: [
        'KB-INCIDENT-§7.1 (Webhook Retries & European Cluster)',
        'KB-SLA-§1.1 (Enterprise SLA Matrix)',
      ],
    },
  },
  {
    id: 'wf_4',
    stepNumber: 4,
    label: 'Gemini Multi-Factor Triage',
    service: 'Gemini 3.8 Flash (Structured Output)',
    iconType: 'Sparkles',
    description: 'Classifies query category, urgency level (P1-P4), sentiment, and generates explicit reasoning based on contract SLA commitments.',
    status: 'active',
    avgLatencyMs: 620,
    successRate: 99.1,
    promptTemplate: `You are an enterprise support triage specialist. Analyze the incoming email, client SLA terms, and available knowledge base. Output strict JSON with category, urgency (P1-P4), sentiment, and reasoning.`,
    sampleInput: {
      model: 'gemini-3.8-flash',
      emailBody: '1,400 shipment notices queued in our retry buffer...',
      clientTier: 'Enterprise Platinum',
    },
    sampleOutput: {
      category: 'Technical Incident',
      urgency: 'P1 Critical',
      sentiment: 'Urgent',
      recommendedSLA: '60 minutes',
      suggestedRole: 'Senior Solutions Engineer',
    },
  },
  {
    id: 'wf_5',
    stepNumber: 5,
    label: 'Grounded Draft Synthesizer',
    service: 'Gemini 3.8 Flash (Citation Grounded)',
    iconType: 'FileText',
    description: 'Drafts a professional reply strictly quoting retrieved knowledge base clauses and client contract terms. Zero hallucinated policies.',
    status: 'active',
    avgLatencyMs: 890,
    successRate: 98.9,
    promptTemplate: `Draft an empathetic and technically accurate reply citing exact sections from the retrieved runbooks. Emphasize queue preservation and retry safety. Do not state policies that are not present in the provided context.`,
    sampleInput: {
      contextDocs: ['KB-INCIDENT-§7.1', 'KB-SLA-§1.1'],
      tone: 'technical',
    },
    sampleOutput: {
      draftSubject: 'Re: URGENT: European webhook endpoint throwing 504 timeouts on dispatch queue',
      citationsCount: 2,
      confidenceScore: 96,
      bodyPreview: 'Hi David, thank you for reaching out... all unacknowledged dispatch notifications are preserved in our durable Kafka buffer...',
    },
  },
  {
    id: 'wf_6',
    stepNumber: 6,
    label: 'Human Review & Gmail Draft Sync',
    service: 'Human-in-the-Loop Safeguard Gate',
    iconType: 'UserCheck',
    description: 'Stages draft in the review queue. Never sends automatically. Enables one-click tone tuning, manual editing, and sync to Gmail Drafts folder.',
    status: 'active',
    avgLatencyMs: 120,
    successRate: 100.0,
    sampleInput: {
      draftId: 'draft_1',
      action: 'Await Human Approval',
      autoSendDisabled: true,
    },
    sampleOutput: {
      isApproved: false,
      syncStatus: 'Staged for Review',
      gmailDraftUrl: 'https://mail.google.com/mail/#drafts',
    },
  },
];
