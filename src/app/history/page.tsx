import type { Metadata } from "next";
import { HistoryList } from "@/components/history-list";

export const metadata: Metadata = {
  title: "History",
  description: "Review your JuniorFlow AI practice tickets.",
};

export default function HistoryPage() {
  return (
    <main className="flex-1">
      <section className="border-b border-[#dce2dc] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#5e7a17]">Your progress</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Practice history.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#64736d]">Return to past tickets, revisit your feedback, and see what to study next.</p>
        </div>
      </section>
      <HistoryList />
    </main>
  );
}
