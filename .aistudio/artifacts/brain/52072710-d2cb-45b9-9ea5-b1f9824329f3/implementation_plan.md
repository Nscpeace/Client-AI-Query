# ClientPulse AI — Client Query Triage & Draft Reply Assistant

An intelligent shared inbox automation assistant that ingests client emails, classifies them by category and urgency, retrieves contextual client records and knowledge base articles, and generates grounded draft replies with source citations for team review—strictly enforcing zero-auto-send safeguards and confidential client exclusions.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during the initial requirements clarification:
> - **Dual Connection Mode**: Live Google Workspace Gmail OAuth integration alongside pre-configured high-fidelity client scenarios (SLA outages, billing disputes, contract renewals, confidential accounts).
> - **AI Engine & Grounding**: Native Gemini model integration (`gemini-3.8-flash`) with strict prompt engineering for multi-factor classification, source-grounded draft creation, and explicit knowledge base citations.
> - **Portfolio Showcase**: Interactive n8n-style automation workflow visualizer tab with live node inspection, step execution traces, and before-and-after operational metrics.

---

### 1. Overview & Core Concept

#### What It Does
ClientPulse AI acts as a 24/7 copilot for client operations and support teams. When an email reaches the shared inbox:
1. It parses message context, sender history, and attachments.
2. It classifies the message into domain categories (Technical, Billing, Account/Contract, Feature Request, Escalation) and assigns an SLA urgency tier (`P1 Critical`, `P2 High`, `P3 Normal`, `P4 Low`).
3. It checks data protection rules: if a client domain is flagged as **Confidential**, raw message bodies are sanitized or excluded from AI processing, and routed immediately to a dedicated lead.
4. It performs semantic lookup across simulated customer records (SLA tier, contract terms, assigned CSM) and a verified knowledge base (billing FAQ, API limits, incident runbooks).
5. It synthesizes a polite, context-aware draft reply citing exact source sections.
6. The draft is staged for one-click human approval or synced directly into Gmail's Drafts folder. **No email is ever sent automatically.**

#### Target Audience & Persona
- **Customer Success Managers (CSMs)** and **Support Team Leads** managing high-volume shared inboxes (`support@`, `billing@`, `enterprise@`).
- **Agency & B2B Service Teams** juggling enterprise clients with strict response SLAs.
- **Freelancers & Operations Engineers** showcasing production automation capabilities on Upwork.

#### Key Value
- **80%+ Faster Response Preparation**: Drastically cuts time spent searching internal documentation and drafting standard replies.
- **Zero SLA Misses**: High-urgency queries surface instantly to designated leads.
- **Zero Risk of Hallucinations / Accidental Sends**: Mandatory human review + grounded source citation guarantee accountability.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Inbox Triage & Queue View**:
   - The user opens the dashboard and views active queues: `All Unhandled`, `P1 Urgent`, `Awaiting Review`, `Approved Drafts`, and `Confidential Routed`.
   - Each query row displays client avatar, company name, subject, classification category, urgency badge, assigned agent, and remaining SLA timer.
2. **Detail & Draft Approval Workspace**:
   - Selecting a query opens a clean 2-column or 3-panel split: original email thread on the left, client profile + knowledge citations in the middle/drawer, and the AI-generated draft editor on the right.
   - Grounded citations (e.g. `[KB-102: Refund Policy §3.2]`) appear as verifiable reference cards.
   - The user can one-click insert snippets, adjust tone (Formal, Conciliatory, Technical, Direct), edit the draft, and click **"Save to Gmail Drafts"** or **"Approve & Mark Ready"**.
3. **Interactive n8n Workflow Visualizer Tab**:
   - An interactive node-based canvas displaying the end-to-end automation pipeline: `Email Ingestion (Gmail/Webhook)` $\rightarrow$ `Security & Confidentiality Filter` $\rightarrow$ `Gemini Classification & Triage` $\rightarrow$ `Knowledge Base Retrieval` $\rightarrow$ `Draft Reply Synthesizer` $\rightarrow$ `Routing & Human Review Gate` $\rightarrow$ `Draft Storage (Gmail API)`.
   - Users can click any node to inspect prompt templates, input/output schemas, latency, and success rates.
4. **Daily Digest & SLA Report**:
   - Executive overview of open queries, average triage response latency, category distribution, and queries nearing SLA breach.
5. **Knowledge Base & Confidentiality Policy Manager**:
   - Quick manager for company policies, FAQ articles, and confidential client exclusion lists.

#### Visual Identity & Theme
- **Aesthetic Direction**: Utilitarian, precision-engineered B2B operations console following the `SaaS & Dashboard` domain constitution. Crisp geometry, high legibility, and zero decorative clutter.
- **Color Palette & Distribution (60-30-10 Rule)**:
  - *Canvas (60%)*: Crisp light workspace (`#F8FAFC` slate-50) with clean `#FFFFFF` panel surfaces (or dark slate `#0F172A` in dark mode).
  - *Structural (30%)*: Hairline dividers (`#E2E8F0` / `#1E293B`), neutral text hierarchy (`#0F172A` display, `#475569` body, `#94A3B8` metadata).
  - *Accent Budget (10%)*: High-intent indigo/azure (`#2563EB`) for primary review actions; semantic status indicators strictly paired with text:
    - P1 Urgent / Escalated: Crimson (`#DC2626`)
    - P2 High: Amber (`#D97706`)
    - P3 / Normal: Slate/Blue (`#2563EB`)
    - P4 Low: Emerald (`#16A34A`)
- **Typography & Scale**:
  - Primary UI & Display: `Plus Jakarta Sans` or `Manrope` for sharp titles, navigation, and badges.
  - Data, Timestamps & SLAs: Monospace tabular numerals (`JetBrains Mono` / `tabular-nums`) to prevent layout shift.
  - Email Body Prose: Clean sans-serif with readable 1.6 line height and max-width reading measure.
- **Zero-Pill & Anti-Slop Enforcement**:
  - No decorative pills around passive text metadata. Inline dot separators (`·`) for message headers.
  - No fake latency/system tickers, no mechanical code prefixes (`// 01_`), no low-opacity watermarks.
  - Filter tabs use standard segmented button controls with distinct active states.

---

### 3. Key Product Decisions & Trade-Offs

| Decision Area | Chosen Approach | Rationale & User Benefit | Alternatives Considered |
|---|---|---|---|
| **Email Ingestion Engine** | Dual Mode: Real Gmail OAuth + In-App Scenario Simulator | Enables real user testing with actual Gmail inboxes, while providing instant, fully populated client scenarios without requiring immediate Google account credentials. | Live OAuth only (breaks immediate evaluation if user lacks test Gmail); Mock data only (lacks production-readiness). |
| **Sending Safeguard** | Staged Drafts Only (`gmail.compose` / drafts API) | Hard guarantee that no email is sent autonomously, mitigating AI hallucination liability and preserving human relationship control. | Auto-send with confidence threshold (high customer risk for enterprise support). |
| **Knowledge Retrieval & Citation** | Grounded in-memory knowledge store with cited section IDs | Every draft explicitly footnotes the knowledge base document and client tier rule used, building trust with the reviewer. | Unbounded LLM generation (hallucinates company policies, refund terms, and SLA windows). |
| **Workflow Canvas** | Interactive n8n-style visualizer node graph with live step inspection | Serves as a compelling portfolio asset for Upwork prospects, demonstrating technical mastery of workflow automation and webhook architecture. | Static PNG diagram (unengaging, non-interactive, doesn't demonstrate live data flow). |
| **Confidential Client Protection** | Domain-based exclusion policy engine | Organizations handling sensitive VIPs or NDAs can automatically route emails without transmitting contents to LLM endpoints. | Universal AI processing (violates enterprise data sovereignty). |

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ClientPulse AI Platform                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌───────────────────────────────────┐               ┌────────────────────────────────────┐
│   Gmail OAuth Connector           │               │   Client Query Simulator Engine    │
│   (Google Workspace OAuth Scope:  │               │   (5 Realistic Pre-built Support   │
│   gmail.readonly, gmail.compose)  │               │   Scenarios with Timestamps & SLA) │
└───────────────────────────────────┘               └────────────────────────────────────┘
         │                                                                   │
         └─────────────────────────────────┬─────────────────────────────────┘
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Triage & Orchestration Pipeline Controller                      │
│                                                                                        │
│  1. Check Confidentiality Rules ──► (Bypass AI & Route directly to Lead if matched)    │
│  2. Client Record Enrichment (Lookup Account Tier, ARR, Assigned CSM, SLA Window)     │
│  3. Knowledge Base Matching (Scan Runbooks, Billing Terms, API Docs)                  │
│  4. Gemini Flash API: Structured JSON Classification & Urgency Scoring                 │
│  5. Gemini Flash API: Grounded Draft Reply Generation with Cited Policy Sections       │
│  6. Smart Team Member Assignment & Escalation Alerting                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌───────────────────┐             ┌────────────────────┐
│  Triage Queue &  │             │ Draft Approval &  │             │ n8n Automation     │
│  Review Board    │             │ Response Editor   │             │ Workflow Canvas    │
│  (SLA Timers,    │             │ (Citations, Tone  │             │ (Node Inspector &  │
│  Filter, Search) │             │ Switcher, Draft)  │             │ Operational ROI)   │
└──────────────────┘             └───────────────────┘             └────────────────────┘
```

#### Core Data Entities
- **ClientQuery**: `id`, `source` (`gmail` | `demo`), `senderName`, `senderEmail`, `clientTier` (`Enterprise`, `Growth`, `Startup`), `subject`, `body`, `receivedAt`, `slaDeadlineMinutes`, `category`, `urgency` (`P1`, `P2`, `P3`, `P4`), `assignedAgent`, `status` (`new`, `draft_ready`, `approved`, `escalated`, `confidential_routed`), `isConfidential`.
- **KnowledgeDoc**: `id`, `title`, `category`, `snippet`, `policyRule`, `lastUpdated`.
- **DraftReply**: `id`, `queryId`, `draftSubject`, `draftBody`, `confidenceScore`, `citedDocIds`, `tone`, `isSavedToGmailDrafts`, `lastEditedAt`.
- **WorkflowNode**: `id`, `label`, `type`, `description`, `status`, `avgLatencyMs`, `configSummary`.

#### Key Sequences & Integration Points
1. **Gmail Ingestion & Draft Creation**:
   - Uses `googleapis.com/gmail/v1/users/me/messages` to inspect inbox threads.
   - Saves approved or staged drafts via `POST https://gmail.googleapis.com/gmail/v1/users/me/drafts` with RFC 2822 base64 message encoding.
   - Clean client-side token management adhering to Workspace Integration guidelines.
2. **Server-Side Gemini AI Triage**:
   - Powered by `gemini-3.8-flash` via the `@google/genai` SDK on server proxy endpoints.
   - Enforces JSON schema output for classification (`category`, `urgency`, `sentiment`, `keyConcerns`, `suggestedRouting`).
   - Grounded draft generation prompt referencing structured knowledge base contexts with direct footnote links.
3. **Execution Plan**:
   - Setup project structure, icons, and UI state models.
   - Implement Triage Queue view, filters, search, and SLA countdowns.
   - Build Email Detail & Grounded Draft Editor with one-click tone modulation and source inspector.
   - Implement n8n-style interactive visualizer canvas with step inspectability and ROI metrics.
   - Implement Knowledge Base and Confidential Client configuration panels.
   - Implement Google Workspace OAuth integration for Gmail live inbox / draft creation.
