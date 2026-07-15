"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle, MessageCircleQuestion, RotateCcw } from "lucide-react";
import { z } from "zod";
import { postJson, ClientApiError } from "@/lib/api-client";
import {
  reviewInputSchema,
  seniorReviewSchema,
  SUBMISSION_TYPES,
  ticketSubmissionSchema,
} from "@/schemas";
import type {
  ReviewInput,
  SeniorReview,
  TicketSubmission,
  WorkTicket,
} from "@/types";
import { SeniorReviewCard } from "@/components/senior-review-card";

const reviewResponseSchema = z.object({ review: seniorReviewSchema });

export function createReviewRequest(
  ticket: WorkTicket,
  submission: TicketSubmission,
): ReviewInput {
  const { createdAt: _createdAt, isDemo: _isDemo, ...generatedTicket } = ticket;
  void _createdAt;
  void _isDemo;
  return reviewInputSchema.parse({
    ticket: generatedTicket,
    ...submission,
  });
}

export function SolutionWorkspace({
  ticket,
  initialSubmission,
  initialReview,
  onSubmission,
  onReview,
}: {
  ticket: WorkTicket;
  initialSubmission?: TicketSubmission;
  initialReview?: SeniorReview;
  onSubmission?: (submission: TicketSubmission) => void;
  onReview?: (submission: TicketSubmission, review: SeniorReview) => void;
}) {
  const initialSubmissionType =
    initialSubmission?.submissionType ?? "Pseudocode / technical plan";
  const [submissionType, setSubmissionType] =
    useState<TicketSubmission["submissionType"]>(initialSubmissionType);
  const [reviewSubmissionType, setReviewSubmissionType] =
    useState<TicketSubmission["submissionType"]>(initialSubmissionType);
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState<SeniorReview | undefined>(initialReview);
  const [error, setError] = useState<ClientApiError | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const formData = new FormData(event.currentTarget);
    const candidate = {
      submissionType,
      approach: String(formData.get("approach") ?? ""),
      code: String(formData.get("code") ?? ""),
      difficulties: String(formData.get("difficulties") ?? ""),
      seniorQuestion: String(formData.get("seniorQuestion") ?? ""),
    };
    const parsed = ticketSubmissionSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(new ClientApiError(parsed.error.issues[0]?.message ?? "Check your submission.", "INVALID_INPUT", false));
      return;
    }

    inFlight.current = true;
    setIsReviewing(true);
    setError(null);
    onSubmission?.(parsed.data);

    try {
      const reviewRequest = createReviewRequest(ticket, parsed.data);
      const result = await postJson(
        "/api/reviews",
        reviewRequest,
        reviewResponseSchema,
      );
      setReview(result.review);
      setReviewSubmissionType(parsed.data.submissionType);
      onReview?.(parsed.data, result.review);
    } catch (caught) {
      setError(caught instanceof ClientApiError ? caught : new ClientApiError("The review failed. Please retry.", "UNKNOWN", true));
    } finally {
      inFlight.current = false;
      setIsReviewing(false);
    }
  }

  function retry() {
    formRef.current?.requestSubmit();
  }

  const inputClass = "mt-2 w-full border border-[#cbd4cc] bg-white px-3.5 py-3 leading-6 placeholder:text-[#97a29c] focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40";

  return (
    <div className="min-w-0 space-y-6">
      <form ref={formRef} onSubmit={submit} className="border border-[#d5ddd6] bg-white">
        <header className="border-b border-[#e1e6e1] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#678616]">Your solution</p>
          <h2 className="mt-2 text-2xl font-semibold">Walk your senior through it.</h2>
          <p className="mt-2 leading-6 text-[#64736d]">The reasoning matters as much as the final code.</p>
        </header>
        <div className="space-y-6 p-6">
          <label className="block text-sm font-semibold">Your approach
            <textarea name="approach" required minLength={20} maxLength={2000} rows={5} className={inputClass} defaultValue={initialSubmission?.approach} placeholder="Explain how you would investigate and solve the ticket…" />
          </label>

          <fieldset>
            <legend className="text-sm font-semibold">Submission type</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {SUBMISSION_TYPES.map((option) => (
                <label
                  key={option}
                  className={
                    "cursor-pointer border px-3 py-2.5 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-[#678616] focus-within:ring-offset-2 " +
                    (submissionType === option
                      ? "border-[#14261f] bg-[#eef1e9] text-[#14261f]"
                      : "border-[#cbd4cc] bg-white text-[#64736d] hover:border-[#84958c]")
                  }
                >
                  <input
                    type="radio"
                    name="submissionType"
                    value={option}
                    checked={submissionType === option}
                    onChange={() => setSubmissionType(option)}
                    className="mr-2 accent-[#678616]"
                  />
                  {option}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-[#74817b]">
              Plans are scored on reasoning and coverage; working code is also reviewed for implementation quality.
            </p>
          </fieldset>

          <label className="block text-sm font-semibold">Code or pseudocode
            <textarea name="code" required minLength={10} maxLength={8000} rows={12} spellCheck={false} className={inputClass + " font-mono text-[13px]"} defaultValue={initialSubmission?.code} placeholder="// Paste code or write clear pseudocode here" />
          </label>
          <label className="block text-sm font-semibold">What was difficult?
            <textarea name="difficulties" maxLength={1200} rows={3} className={inputClass} defaultValue={initialSubmission?.difficulties} placeholder="Tell your senior where you felt unsure…" />
          </label>
          <label className="block text-sm font-semibold"><span className="flex items-center gap-2"><MessageCircleQuestion aria-hidden="true" size={17} className="text-[#678616]" />Question for your senior</span>
            <textarea name="seniorQuestion" maxLength={1200} rows={3} className={inputClass} defaultValue={initialSubmission?.seniorQuestion} placeholder="What would you like clarified?" />
          </label>

          {error && (
            <div role="alert" className="border border-[#e5c8bc] bg-[#fff7f3] p-4 text-sm text-[#8f3f2d]">
              <p className="font-semibold">Review unavailable</p>
              <p className="mt-1 leading-6">{error.message}</p>
              <div className="mt-3 flex flex-wrap gap-4">
                {error.retryable && <button type="button" onClick={retry} className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4"><RotateCcw aria-hidden="true" size={15} />Retry</button>}
                <Link href="/demo" className="font-semibold underline underline-offset-4">Open sample demo</Link>
              </div>
            </div>
          )}

          <button type="submit" disabled={isReviewing} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#14261f] px-5 font-semibold text-white transition-colors hover:bg-[#29483b] disabled:cursor-not-allowed disabled:opacity-60">
            {isReviewing ? <><LoaderCircle aria-hidden="true" size={18} className="animate-spin" />GPT-5.6 is reviewing…</> : <>Request senior review <ArrowRight aria-hidden="true" size={18} /></>}
          </button>
        </div>
      </form>
      {review && (
        <SeniorReviewCard
          review={review}
          submissionType={reviewSubmissionType}
        />
      )}
    </div>
  );
}
