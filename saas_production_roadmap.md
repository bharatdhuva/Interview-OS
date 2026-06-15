# SaaS Production Roadmap & Conceptual Guide: Interview-OS

This document details the theoretical architecture, data flows, and features for the core capabilities and advanced SaaS enhancements of Interview-OS, modeled after industry leaders like **CoderPad**, **HackerRank**, **CodeSignal**, and **Codility**.

---

## Part 1: Core Remaining Features (Theoretical Concepts)

### 1. Custom Stdin Input Console
* **Concept**: Standard input (stdin) enables candidates to test interactive command-line or console-based scripts. It allows the editor workspace to accept input parameters that are passed into the runtime thread during execution.
* **Architecture**: The output console UI is enhanced with an input pane. When the candidate triggers code execution, the frontend bundles the code payload along with this custom stdin text. The server forwards both elements to the sandboxed execution service (Judge0), which runs the logic inside an isolated container, pipes the stdin to the process, and returns the stdout/stderr outcomes.

### 2. Time-Travel Session Replay
* **Concept**: A visual timeline player that captures a candidate's complete coding and drawing journey, allowing reviewers to replay the interview post-session.
* **Architecture**: The system records time-stamped history snapshots (code buffers and whiteboard drawing structures) as chronological frames in the database. During playback, an interviewer uses a custom control bar (featuring play, pause, playback speeds, and a progress timeline slider) to step through these frames sequentially, reconstructing the candidate's exact line-by-line coding and drawing flow.

### 3. Socket Connection Resilience & State Recovery
* **Concept**: Ensures session durability by automatically recovering the client state if a candidate or interviewer momentarily loses internet connectivity during the live session.
* **Architecture**: When a network drop occurs, the client enters an auto-reconnect cycle. Upon successfully re-establishing the socket connection, the client requests the latest synchronized state from the server. The server retrieves the cached room snapshots (active files, content differentials, and whiteboard elements) and pushes them to the client to align both nodes instantly without any progress loss.

---

## Part 2: Advanced Optional SaaS Features (Competitor Benchmarking)

These advanced features align Interview-OS with enterprise standards established by the industry:

### 1. Full-Stack Workspace Environments & Attached Databases (CoderPad Style)
* **Concept**: Evaluates candidates under realistic software engineering conditions by allowing them to run full-stack projects (e.g., Node/Express backends connected to React frontends) rather than simple algorithmic scripts.
* **Architecture**:
  * **Attached Database Containers**: Attaches MySQL or PostgreSQL instances containing pre-populated seed data to the interview workspace. This allows candidates to construct complex database queries or interact with databases using ORMs like Sequelize.
  * **In-Browser Web Previews**: Integrates port-forwarding proxies inside the sandboxed code runner. The server spins up the candidate's custom web app, captures the local loopback port, and embeds the output inside a client-side iframe window.

### 2. Anti-Plagiarism dual-engine & Keystroke Dynamics (Codility & HackerRank Style)
* **Concept**: Measures the integrity of code submissions using structural analytics and behavioral patterns instead of simple copy-paste constraints.
* **Architecture**:
  * **MOSS (Measure of Software Similarity)**: An abstract syntax tree (AST) parsing engine that compiles and compares code structures rather than raw text variables. This catches candidates who simply rename variables or move functions to evade text-matching checks.
  * **Keystroke Dynamics**: Logs keydown events to chart typing speeds and cadence. AI-generated code pasted from the clipboard or inserted via external extensions shows anomalous entry profiles compared to manual writing.

### 3. Identity Verification & Comprehensive Proctoring (CodeSignal Style)
* **Concept**: Confirms candidate identity and enforces strict supervision rules during high-stakes hiring assessments.
* **Architecture**:
  * **Photo ID Check**: Integrates pre-interview onboarding flows where candidates upload government-issued photo IDs and capture live selfies. The system matches facial structures before granting entry.
  * **Continuous Media Streaming**: Captures webcam feeds, microphones, and shared screens throughout the test. Behavioral triggers flag extra faces in the camera frame, speaking voices, or secondary monitors.
  * **Suspicion Score**: Gathers proctor signals (blur events, audio volume spikes, clipboard actions, tab departures) into a single score indicator, highlighting files that require recruiter inspection.

### 4. Applicant Tracking System (ATS) Integrations (Greenhouse & Lever Style)
* **Concept**: Connects the interview platform directly to enterprise HR systems to automate assessment invitation workflows and synchronize scorecards.
* **Architecture**: 
  * **Webhook Synchronization**: The ATS triggers an API call on candidate stage progression, prompting the interview server to automatically generate a room token and mail the invite link.
  * **Scorecard Backfill**: On completion of the feedback form or AI copilot assessment review, the platform sends a secure request containing ratings, strengths, and PDF review documents back to the candidate's profile page inside the ATS.

### 5. Take-Home Asynchronous Project Mode (HackerRank Style)
* **Concept**: Support for take-home coding assessments where candidates solve multi-file challenges in their own time, backed by automated unit test suites.
* **Architecture**: The candidate receives access to a timed coding workspace with preset limits. When they submit, the backend runner executes the code against a private test harness, grades logic coverage, and logs compliance logs automatically.
