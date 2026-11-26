import React from "react";
import { Link } from "react-router-dom";
import AuthNavbar from "@/components/layout/AuthNavbar";

const PAGE_CONTENT = {
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    updated: "Last updated: November 2026",
    sections: [
      {
        heading: "1. Using InterviewOS",
        body: "InterviewOS provides a collaborative technical interview workspace including video calling, code editing, code execution, whiteboarding, and AI-assisted evaluation drafts. You agree to use the platform lawfully and only for authorized interviewing or practice.",
      },
      {
        heading: "2. Accounts & Access",
        body: "You are responsible for maintaining the confidentiality of your account credentials and invite links. Interviewers control when feedback is shared with candidates.",
      },
      {
        heading: "3. Code Execution & Proctoring",
        body: "Code submitted in rooms is executed in sandboxed containers via Judge0. Proctoring signals (such as tab switches or fullscreen exits) are logged only when enabled for an active interview session.",
      },
      {
        heading: "4. AI Drafts",
        body: "AI-generated evaluation drafts are decision-support tools for interviewers. Final hiring decisions and shared feedback remain the responsibility of the interviewer.",
      },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    updated: "Last updated: November 2026",
    sections: [
      {
        heading: "1. Data We Collect",
        body: "We store account details (name, email, role), interview room metadata, code snapshots, whiteboard state, chat messages, and feedback submitted during your sessions.",
      },
      {
        heading: "2. How Data Is Used",
        body: "Session data powers live collaboration, time-travel session replay, and optional AI evaluation drafts requested by the room interviewer.",
      },
      {
        heading: "3. Candidate Visibility",
        body: "AI evaluation drafts and interviewer notes are private to the interviewer unless explicitly shared via the feedback share action.",
      },
      {
        heading: "4. Contact",
        body: "For data deletion or privacy questions, email support@interviewos.io.",
      },
    ],
  },
  about: {
    eyebrow: "Company",
    title: "About InterviewOS",
    updated: "Built for clear engineering signal",
    sections: [
      {
        heading: "Why InterviewOS exists",
        body: "Technical interviews shouldn't require juggling four disconnected tabs for video, code, whiteboarding, and feedback. InterviewOS puts the entire conversation in one workspace.",
      },
      {
        heading: "Built by Bharat Dhuva",
        body: "Explore more projects, architecture notes, and contact details on my portfolio at bharatdhuva.vercel.app.",
      },
    ],
    showBuilderCtas: true,
  },
  careers: {
    eyebrow: "Company",
    title: "Careers",
    updated: "Open collaboration",
    sections: [
      {
        heading: "Work with us",
        body: "InterviewOS is an active open-source and engineering project focused on real-time collaboration, WebRTC, and applied AI evaluation systems.",
      },
      {
        heading: "Reach out",
        body: "Interested in collaborating or contributing? Email support@interviewos.io or open a pull request on GitHub.",
      },
    ],
  },
  contact: {
    eyebrow: "Support",
    title: "Contact",
    updated: "We'd love to hear from you",
    sections: [
      {
        heading: "Email",
        body: "Reach our team anytime at support@interviewos.io for demos, feedback, or technical support.",
      },
      {
        heading: "GitHub & Portfolio",
        body: "Report issues at github.com/bharatdhuva/Interview-OS or view my portfolio at bharatdhuva.vercel.app.",
      },
    ],
    showBuilderCtas: true,
  },
  support: {
    eyebrow: "Help & Support",
    title: "Support",
    updated: "InterviewOS Help Center",
    sections: [
      {
        heading: "Account & Login Help",
        body: "If you forgot your password, use the Forgot password flow on the Sign In page to reset it via email OTP. You can also sign in with Google or GitHub.",
      },
      {
        heading: "Room & Interview Troubleshooting",
        body: "Ensure camera/microphone permissions are allowed in your browser for WebRTC calls. Code execution uses Judge0 and requires an active interview session.",
      },
      {
        heading: "Direct Contact & Portfolio",
        body: "Still stuck? Reach out via email, check the GitHub repo, or visit my portfolio at bharatdhuva.vercel.app.",
      },
    ],
    showBuilderCtas: true,
  },
  changelog: {
    eyebrow: "Product",
    title: "Changelog",
    updated: "Recent releases",
    sections: [
      {
        heading: "Phase 0 & 1 — AI Foundation & Post-Interview Evaluator",
        body: "Added provider-agnostic LLM client (Groq, Gemini, OpenAI) with Zod-validated structured outputs, prompt-injection delimiter guardrails, AiCallLog observability, and interviewer-only AI draft generation with ?t=ms replay evidence links.",
      },
      {
        heading: "Core Platform",
        body: "Real-time Monaco editor sync, E2E-encrypted Excalidraw whiteboard, WebRTC P2P video/audio, Judge0 code execution across 7 languages, 3-strike proctoring, and time-travel session replay.",
      },
    ],
  },
};

export default function InfoPage({ page = "about" }) {
  const content = PAGE_CONTENT[page] || PAGE_CONTENT.about;

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-[#fafbf9] text-[#171917]"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <AuthNavbar pageType="forgot" />

      <main className="flex-1 w-full max-w-[760px] mx-auto px-6 py-14">
        <p className="text-[11.5px] uppercase tracking-[0.13em] text-[#657168] mb-3">
          {content.eyebrow}
        </p>
        <h1
          className="text-[40px] leading-[1.06] font-semibold tracking-[-0.04em] text-[#171917] mb-2"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
          }}
        >
          {content.title}
        </h1>
        <p className="text-[13px] text-[#707870] mb-10">{content.updated}</p>

        <div className="space-y-8 border-t border-[#e2e7e1] pt-8">
          {content.sections.map((sec) => (
            <section key={sec.heading}>
              <h2
                className="text-[18px] font-semibold text-[#171917] mb-2"
                style={{
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
                }}
              >
                {sec.heading}
              </h2>
              <p className="text-[15px] text-[#566059] leading-[1.7]">
                {sec.body}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[#e2e7e1] flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="text-[14px] font-semibold text-[#008a52] hover:underline"
          >
            ← Back to home
          </Link>

          {content.showBuilderCtas && (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://bharatdhuva.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[42px] px-5 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13px] font-semibold transition-all hover:-translate-y-0.5"
              >
                Portfolio ↗
              </a>
              <a
                href="mailto:support@interviewos.io?subject=InterviewOS%20Support%20Request"
                className="inline-flex items-center justify-center min-h-[42px] px-5 rounded-full border border-[#111111] bg-transparent hover:bg-[#eef5ef] text-[#111111] text-[13px] font-semibold transition-all hover:-translate-y-0.5"
              >
                Email Support
              </a>
              <a
                href="https://github.com/bharatdhuva/Interview-OS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[42px] px-5 rounded-full border border-[#e2e7e1] bg-white hover:bg-[#eef5ef] text-[#171917] text-[13px] font-semibold transition-all hover:-translate-y-0.5"
              >
                GitHub ↗
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
