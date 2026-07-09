# Nexaviq Vendor Pitch Flowchart

This flowchart is designed for you to share with BPO vendors, call center managers, and enterprise stakeholders. It explains the step-by-step business value and operational process of **Nexaviq**.

```mermaid
graph TD
    %% Custom Styling for Pitch Deck
    classDef step fill:#1E293B,stroke:#3B82F6,stroke-width:2px,color:#fff;
    classDef ai fill:#1e1b4b,stroke:#8b5cf6,stroke-width:2px,color:#fff;
    classDef output fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef value fill:#1c1917,stroke:#f59e0b,stroke-width:2px,color:#fff;

    Start([1. Call Ingestion]):::step --> Ingest{How is the call received?}
    
    Ingest -->|A. Auto Integration| Webhook["API / Telephony Webhook (Genesys, Twilio, etc.)<br/>• Real-time, instant trigger<br/>• Zero manual effort"]:::step
    Ingest -->|B. Manual Upload| DragDrop["Portal Drag & Drop<br/>• Batch upload call recordings<br/>• Support for multiple file formats"]:::step
    
    Webhook --> STT["2. High-Accuracy AI Transcription<br/>• Natively understands English, Hindi & regional languages<br/>• Auto-separates Agent vs. Customer channels"]:::ai
    DragDrop --> STT
    
    STT --> Grade["3. AI Audit & Scoring (Gemini Engine)<br/>• Grades 100% of calls against your custom SOPs<br/>• Checks compliance, greetings, hold times, and empathy<br/>• Flags fatal errors (e.g. missing disclaimers) instantly"]:::ai
    
    Grade --> Dash["4. Portal Deliverables"]:::output
    
    Dash --> Dash1["For QA Managers & Executives:<br/>• Pareto charts highlighting top reasons for failures<br/>• Compliance trend graphs<br/>• Custom Regional billing ROI calculators"]:::value
    
    Dash --> Dash2["For Agents:<br/>• Actionable feedback within minutes of call wrap-up<br/>• Specific timestamped strengths & areas for improvement"]:::value
    
    Dash1 --> End([Goal: 100% Compliance, Automated Training, & Up to 80% QA Cost Savings]):::value
    Dash2 --> End
```

### How to use this flowchart for your pitch:
1. **VS Code / Markdown Viewer**: Open this file (`vendor_flowchart.md`) in your editor to preview the visual diagram.
2. **Export as Image**: 
   * Copy the code block starting with ````mermaid` and ending with ````.
   * Go to **[mermaid.live](https://mermaid.live/)**.
   * Paste the code on the left pane.
   * Under the diagram on the right, click **Actions -> Copy PNG** or **SVG** to download an image file you can insert directly into your pitch decks, PDF documents, or emails to vendors.
