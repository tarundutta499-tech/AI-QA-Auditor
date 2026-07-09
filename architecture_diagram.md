# Nexaviq Platform Architecture Diagram

Below is the complete system and data flow diagram for the **Nexaviq** platform. You can copy the code block below or render it to preview.

```mermaid
graph TD
    %% Colors & Styles
    classDef external fill:#1E293B,stroke:#3B82F6,stroke-width:2px,color:#fff;
    classDef engine fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#fff;
    classDef database fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef frontend fill:#1c1917,stroke:#f59e0b,stroke-width:2px,color:#fff;

    %% 1. Ingestion Sources
    subgraph Ingestion ["Telephony & Ingestion Sources"]
        Genesys["Genesys Cloud Webhook"]:::external
        Twilio["Twilio / Amazon Connect"]:::external
        PortalUpload["Manual Call Upload (Portal)"]:::external
    end

    %% 2. Webhook Ingestion API
    subgraph CoreAPI ["Nexaviq API Router (Next.js)"]
        IngestAPI["/api/v1/ingest API Gateway"]:::engine
        TranscribeAPI["/api/transcribe (Audio Extraction)"]:::engine
        AuditEngine["AI Audit Engine (Gemini API)"]:::engine
    end

    %% 3. Database Layer
    subgraph Storage ["Supabase PostgreSQL Database"]
        T_Users["users (Roles & Companies)"]:::database
        T_Calls["calls (Metadata & Status)"]:::database
        T_Audits["audits (Empathy, Compliance, Fatal Errors)"]:::database
        T_Results["audit_results (Parameters Checklist)"]:::database
        T_Coaching["coaching (Agent Feedback Sessions)"]:::database
        T_Calibrations["calibrations (QA Alignment Verification)"]:::database
    end

    %% 4. Portal Frontend Client
    subgraph Frontend ["Manager & Agent Portal"]
        OverviewTab["Executive Overview (Trends Chart)"]:::frontend
        TeamTab["Team Performance & Leaderboards"]:::frontend
        BellCurve["Bell Curve performance distribution"]:::frontend
        ParetoChart["Root Cause Failure Analysis (Pareto)"]:::frontend
        CoachingTab["Coaching ROI Tracking"]:::frontend
    end

    %% Flows & Connections
    Genesys --> IngestAPI
    Twilio --> IngestAPI
    PortalUpload --> TranscribeAPI
    
    IngestAPI --> T_Calls
    TranscribeAPI --> AuditEngine
    
    AuditEngine --> T_Audits
    AuditEngine --> T_Results
    
    %% Relationships in DB
    T_Users -->|agent_id| T_Calls
    T_Calls -->|call_id| T_Audits
    T_Audits -->|audit_id| T_Results
    T_Audits -->|audit_id| T_Coaching
    T_Audits -->|audit_id| T_Calibrations

    %% Client Frontend Queries
    T_Audits & T_Results & T_Coaching & T_Calibrations -->|Queries via Supabase Client| Frontend
    
    Frontend --> OverviewTab
    Frontend --> TeamTab
    Frontend --> BellCurve
    Frontend --> ParetoChart
    Frontend --> CoachingTab
```

### How to use this diagram:
1. **GitHub/GitLab**: When you commit this markdown file, GitHub will automatically render it as an interactive visual diagram.
2. **Mermaid Live Editor**: You can copy-paste the code inside the block directly into [Mermaid Live Editor](https://mermaid.live/) to export it as a high-quality PNG, SVG, or PDF document for presentations.
