"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

export type GenerationPhase = "preparing" | "creating" | "ready";

export function waitForProgressPaint() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.setTimeout(resolve, 300));
    });
  });
}

export function GenerationLoading({
  phase,
  copy,
}: {
  phase: GenerationPhase;
  copy: {
    preparing: string;
    creating: string;
    ready: string;
    steps: Record<GenerationPhase, string>;
    waiting: string;
    elapsed: string;
  };
}) {
  const [elapsed, setElapsed] = useState(0);
  const phases: GenerationPhase[] = ["preparing", "creating", "ready"];
  const currentIndex = phases.indexOf(phase);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 border border-[#d5ddd6] bg-white p-4" role="status" aria-live="polite" aria-atomic="true">
      <div className="h-1 overflow-hidden bg-[#e4e9e2]" role="progressbar" aria-valuetext={copy[phase]}>
        <div className="h-full w-full bg-[#8bb431] motion-safe:animate-pulse" />
      </div>
      <div className="mt-3 flex items-start gap-2.5">
        {phase === "ready"
          ? <Check aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[#5e7a17]" />
          : <LoaderCircle aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[#5e7a17] motion-safe:animate-spin" />}
        <div>
          <p className="text-sm font-semibold text-[#14261f]">{copy[phase]}</p>
          <p className="mt-1 text-xs leading-5 text-[#66736d]">{copy.waiting}</p>
          <p className="mt-1 text-xs tabular-nums text-[#66736d]">{copy.elapsed.replace("{seconds}", String(elapsed))}</p>
        </div>
      </div>
      <ol className="mt-3 grid gap-1.5 text-xs text-[#66736d]">
        {phases.map((item, index) => (
          <li key={item} className="flex items-center gap-2" aria-current={item === phase ? "step" : undefined}>
            {index < currentIndex || item === "ready" && phase === "ready" ? <Check aria-hidden="true" size={13} className="text-[#5e7a17]" /> : <span aria-hidden="true" className="ml-1 size-1.5 rounded-full bg-[#aab5ae]" />}
            <span className={item === phase ? "font-semibold text-[#14261f]" : undefined}>{copy.steps[item]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
