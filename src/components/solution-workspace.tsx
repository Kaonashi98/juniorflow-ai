"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  MessageCircleQuestion,
  Pencil,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
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
  TicketLanguage,
} from "@/types";
import { SeniorReviewCard } from "@/components/senior-review-card";
import { useAccess, useLanguage } from "@/components/app-providers";
import { UI_COPY, localizedApiError } from "@/lib/ui-copy";
import { formatSubmissionType } from "@/lib/presentation";

const reviewResponseSchema = z.object({ review: seniorReviewSchema });

export function createReviewRequest(
  ticket: WorkTicket,
  submission: TicketSubmission,
  sessionId: string,
  submissionRevision: number,
  language: TicketLanguage = "English",
): ReviewInput {
  const { createdAt: _createdAt, isDemo: _isDemo, ...generatedTicket } = ticket;
  void _createdAt;
  void _isDemo;
  return reviewInputSchema.parse({
    sessionId,
    submissionRevision,
    ticket: generatedTicket,
    language,
    ...submission,
  });
}

export function canRequestReview({
  hasReview,
  isReviewing,
  isSubmissionValid,
  hasSubmissionChanged,
}: {
  hasReview: boolean;
  isReviewing: boolean;
  isSubmissionValid: boolean;
  hasSubmissionChanged: boolean;
}) {
  return !hasReview &&
    !isReviewing &&
    isSubmissionValid &&
    hasSubmissionChanged;
}

export function SolutionWorkspace({
  sessionId,
  submissionRevision,
  ticket,
  ticketLanguage,
  initialSubmission,
  initialReview,
  onSubmission,
  onReview,
  onEditSubmission,
}: {
  sessionId: string;
  submissionRevision: number;
  ticket: WorkTicket;
  ticketLanguage?: TicketLanguage;
  initialSubmission?: TicketSubmission;
  initialReview?: SeniorReview;
  onSubmission?: (submission: TicketSubmission) => void;
  onReview?: (submission: TicketSubmission, review: SeniorReview) => void;
  onEditSubmission?: () => void;
}) {
  const { unlocked, unlockRevision, openUnlock, dismissUnlockSuccess } = useAccess();
  const { t, locale } = useLanguage();
  const solutionCopy = UI_COPY[locale].solution;
  const commonCopy = UI_COPY[locale].common;
  const initialSubmissionType =
    initialSubmission?.submissionType ?? "Pseudocode / technical plan";
  const [submissionType, setSubmissionType] =
    useState<TicketSubmission["submissionType"]>(initialSubmissionType);
  const [reviewSubmissionType, setReviewSubmissionType] =
    useState<TicketSubmission["submissionType"]>(initialSubmissionType);
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState<SeniorReview | undefined>(initialReview);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [hasSubmissionChanged, setHasSubmissionChanged] =
    useState(!initialReview);
  const [isSubmissionValid, setIsSubmissionValid] = useState(
    initialSubmission
      ? ticketSubmissionSchema.safeParse(initialSubmission).success
      : false,
  );
  const [error, setError] = useState<ClientApiError | null>(null);
  const observedUnlockRevision = useRef(unlockRevision);
  useEffect(() => {
    if (observedUnlockRevision.current === unlockRevision) return;
    observedUnlockRevision.current = unlockRevision;
    const timeout = window.setTimeout(() => {
      setError((current) => current?.code === "ACCESS_REQUIRED" ? null : current);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [unlockRevision]);  const formRef = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);
  const hasReview = Boolean(review);

  function submissionFromForm(
    form: HTMLFormElement,
    type = submissionType,
  ) {
    const formData = new FormData(form);
    return {
      submissionType: type,
      approach: String(formData.get("approach") ?? ""),
      code: String(formData.get("code") ?? ""),
      difficulties: String(formData.get("difficulties") ?? ""),
      seniorQuestion: String(formData.get("seniorQuestion") ?? ""),
    };
  }

  function markSubmissionChanged(
    form: HTMLFormElement | null,
    type = submissionType,
  ) {
    if (!form) return;
    setHasSubmissionChanged(true);
    setIsSubmissionValid(
      ticketSubmissionSchema.safeParse(
        submissionFromForm(form, type),
      ).success,
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    dismissUnlockSuccess();
    if (!unlocked) {
      openUnlock();
      setError(new ClientApiError(t("profile.unlockRequired"), "ACCESS_REQUIRED", false));
      return;
    }

    if (review) {
      setError(new ClientApiError(
        solutionCopy.duplicate,
        "DUPLICATE_REVIEW",
        false,
      ));
      return;
    }

    const parsed = ticketSubmissionSchema.safeParse(
      submissionFromForm(event.currentTarget),
    );
    if (!parsed.success) {
      setError(new ClientApiError(parsed.error.issues[0]?.message ?? solutionCopy.invalid, "INVALID_INPUT", false));
      setIsSubmissionValid(false);
      return;
    }

    if (!hasSubmissionChanged) {
      setError(new ClientApiError(
        solutionCopy.changed,
        "INVALID_INPUT",
        false,
      ));
      return;
    }

    inFlight.current = true;
    setIsReviewing(true);
    setError(null);
    onSubmission?.(parsed.data);

    try {
      const reviewRequest = createReviewRequest(
        ticket,
        parsed.data,
        sessionId,
        submissionRevision,
        ticketLanguage,
      );
      const result = await postJson(
        "/api/reviews",
        reviewRequest,
        reviewResponseSchema,
      );
      setReview(result.review);
      setReviewSubmissionType(parsed.data.submissionType);
      setHasSubmissionChanged(false);
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

  function confirmEditSubmission() {
    setReview(undefined);
    setIsEditDialogOpen(false);
    setError(null);
    setHasSubmissionChanged(false);
    if (formRef.current) {
      setIsSubmissionValid(
        ticketSubmissionSchema.safeParse(
          submissionFromForm(formRef.current),
        ).success,
      );
    }
    onEditSubmission?.();
  }

  const requestEnabled = canRequestReview({
    hasReview,
    isReviewing,
    isSubmissionValid,
    hasSubmissionChanged,
  });
  const inputClass = "mt-2 w-full border border-[#cbd4cc] bg-white px-3.5 py-3 leading-6 placeholder:text-[#6a766f] focus:border-[#678616] focus:ring-2 focus:ring-[#c8f169]/40 read-only:cursor-default read-only:bg-[#f3f5f1] read-only:text-[#52615b]";

  return (
    <div className="min-w-0 space-y-6">
      <form ref={formRef} onSubmit={submit} className="border border-[#d5ddd6] bg-white">
        <header className="border-b border-[#e1e6e1] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5e7a17]">{solutionCopy.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold">{solutionCopy.title}</h2>
          <p className="mt-2 leading-6 text-[#64736d]">
            {hasReview
              ? solutionCopy.locked
              : solutionCopy.intro}
          </p>
        </header>
        <div className="space-y-6 p-6">
          <label className="block text-sm font-semibold">{solutionCopy.approach}<span className="mt-1 block font-normal leading-5 text-[#66736d]">{solutionCopy.approachHelp}</span>
            <textarea
              name="approach"
              required
              readOnly={hasReview}
              minLength={20}
              maxLength={2000}
              rows={5}
              className={inputClass}
              defaultValue={initialSubmission?.approach}
              onChange={(event) => markSubmissionChanged(event.currentTarget.form)}
              placeholder={solutionCopy.approachPlaceholder}
            />
          </label>

          <fieldset disabled={hasReview}>
            <legend className="text-sm font-semibold">{solutionCopy.type}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {SUBMISSION_TYPES.map((option) => (
                <label
                  key={option}
                  className={
                    "border px-3 py-2.5 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-[#678616] focus-within:ring-offset-2 " +
                    (hasReview ? "cursor-default opacity-75 " : "cursor-pointer ") +
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
                    onChange={(event) => {
                      setSubmissionType(option);
                      markSubmissionChanged(event.currentTarget.form, option);
                    }}
                    className="mr-2 accent-[#678616]"
                  />
                  {formatSubmissionType(option, locale)}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs leading-5 text-[#66736d]">
              {solutionCopy.planHelp}
            </p>
          </fieldset>

          <label className="block text-sm font-semibold">{solutionCopy.code}
            <textarea
              name="code"
              required
              readOnly={hasReview}
              minLength={10}
              maxLength={8000}
              rows={12}
              spellCheck={false}
              className={inputClass + " font-mono text-[13px]"}
              defaultValue={initialSubmission?.code}
              onChange={(event) => markSubmissionChanged(event.currentTarget.form)}
              placeholder={solutionCopy.codePlaceholder}
            />
          </label>
          <label className="block text-sm font-semibold">{solutionCopy.difficult}<span className="mt-1 block font-normal leading-5 text-[#66736d]">{solutionCopy.difficultHelp}</span>
            <textarea
              name="difficulties"
              readOnly={hasReview}
              maxLength={1200}
              rows={3}
              className={inputClass}
              defaultValue={initialSubmission?.difficulties}
              onChange={(event) => markSubmissionChanged(event.currentTarget.form)}
              placeholder={solutionCopy.difficultPlaceholder}
            />
          </label>
          <label className="block text-sm font-semibold"><span className="flex items-center gap-2"><MessageCircleQuestion aria-hidden="true" size={17} className="text-[#5e7a17]" />{solutionCopy.question}</span><span className="mt-1 block font-normal leading-5 text-[#66736d]">{solutionCopy.questionHelp}</span>
            <textarea
              name="seniorQuestion"
              readOnly={hasReview}
              maxLength={1200}
              rows={3}
              className={inputClass}
              defaultValue={initialSubmission?.seniorQuestion}
              onChange={(event) => markSubmissionChanged(event.currentTarget.form)}
              placeholder={solutionCopy.questionPlaceholder}
            />
          </label>

          {error && (
            <div role="alert" className="border border-[#e5c8bc] bg-[#fff7f3] p-4 text-sm text-[#8f3f2d]">
              <p className="font-semibold">{solutionCopy.unavailable}</p>
              <p className="mt-1 leading-6">{localizedApiError(error.code, locale)}</p>
              <div className="mt-3 flex flex-wrap gap-4">
                {error.retryable && <button type="button" onClick={retry} className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4"><RotateCcw aria-hidden="true" size={15} />{commonCopy.retry}</button>}
                <Link href="/demo" className="font-semibold underline underline-offset-4">{commonCopy.demo}</Link>
              </div>
            </div>
          )}

          {hasReview ? (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <button type="button" disabled className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#eef1e9] px-5 font-semibold text-[#52615b]">
                <Check aria-hidden="true" size={18} />{solutionCopy.complete}
              </button>
              <button
                type="button"
                onClick={() => setIsEditDialogOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#14261f] px-5 font-semibold text-[#14261f] transition-colors hover:bg-[#f4f6f1] focus-visible:ring-2 focus-visible:ring-[#678616] focus-visible:ring-offset-2"
              >
                <Pencil aria-hidden="true" size={17} />{solutionCopy.edit}
              </button>
            </div>
          ) : (
            <button type="submit" disabled={!requestEnabled} className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#14261f] px-5 font-semibold text-white transition-colors hover:bg-[#29483b] disabled:cursor-not-allowed disabled:opacity-60">
              {isReviewing ? <><LoaderCircle aria-hidden="true" size={18} className="animate-spin" />{solutionCopy.reviewing}</> : <>{solutionCopy.request} <ArrowRight aria-hidden="true" size={18} /></>}
            </button>
          )}
        </div>
      </form>

      {review && (
        <SeniorReviewCard
          review={review}
          submissionType={reviewSubmissionType}
        />
      )}

      <EditSubmissionDialog
        open={isEditDialogOpen}
        onCancel={() => setIsEditDialogOpen(false)}
        onConfirm={confirmEditSubmission}
      />
    </div>
  );
}

export function EditSubmissionDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { locale } = useLanguage();
  const copy = UI_COPY[locale];
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    cancelRef.current?.focus();

    return () => previousFocusRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14261f]/55 p-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-submission-title"
        aria-describedby="edit-submission-description"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
            return;
          }

          if (event.key === "Tab") {
            const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
              "button:not([disabled])",
            );
            const first = focusable?.[0];
            const last = focusable?.[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
        className="w-full max-w-md border border-[#14261f] bg-white p-6 shadow-[6px_6px_0_#c8f169]"
      >
        <span className="flex size-10 items-center justify-center bg-[#fff1e8] text-[#9a5137]">
          <TriangleAlert aria-hidden="true" size={20} />
        </span>
        <h2 id="edit-submission-title" className="mt-4 text-xl font-semibold">
          {copy.solution.editTitle}
        </h2>
        <p id="edit-submission-description" className="mt-2 leading-7 text-[#64736d]">
          {copy.solution.editDescription}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="min-h-11 border border-[#cbd4cc] px-4 font-semibold focus-visible:ring-2 focus-visible:ring-[#678616] focus-visible:ring-offset-2"
          >
            {copy.common.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-11 bg-[#14261f] px-4 font-semibold text-white focus-visible:ring-2 focus-visible:ring-[#678616] focus-visible:ring-offset-2"
          >
            {copy.solution.remove}
          </button>
        </div>
      </div>
    </div>
  );
}
