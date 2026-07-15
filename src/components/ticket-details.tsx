import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Code2,
  FileCode2,
  Flag,
  Lightbulb,
  Target,
} from "lucide-react";
import type { WorkTicket } from "@/types";

export function TicketDetails({ ticket }: { ticket: WorkTicket }) {
  return (
    <article className="min-w-0 border border-[#d5ddd6] bg-white">
      <header className="border-b border-[#dfe5df] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {ticket.isDemo && <span className="bg-[#c8f169] px-2.5 py-1 text-xs font-bold tracking-wide text-[#14261f]">SAMPLE TICKET / DEMO MODE</span>}
          <span className="border border-[#d5ddd6] px-2.5 py-1 font-mono text-xs text-[#64736d]">{ticket.ticketId}</span>
        </div>
        <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">{ticket.title}</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Meta icon={Flag} label="Priority" value={ticket.priority} />
          <Meta icon={Target} label="Difficulty" value={ticket.difficulty} />
          <Meta icon={Clock3} label="Estimated" value={ticket.estimatedTime} />
        </div>
      </header>

      <div className="space-y-9 p-6 sm:p-8">
        <Section title="Company context"><p>{ticket.companyContext}</p></Section>
        <Section title="The problem"><p>{ticket.problem}</p></Section>
        <section className="border-l-4 border-[#c8f169] bg-[#f5f8ef] p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Target aria-hidden="true" size={18} />Objective</h2>
          <p className="mt-2 leading-7 text-[#52615b]">{ticket.objective}</p>
        </section>
        <div className="grid gap-8 md:grid-cols-2">
          <Section title="Requirements"><BulletList items={ticket.requirements} /></Section>
          <Section title="Acceptance criteria">
            <ul className="space-y-3">{ticket.acceptanceCriteria.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 aria-hidden="true" size={18} className="mt-1 shrink-0 text-[#5e7a17]" /><span>{item}</span></li>)}</ul>
          </Section>
        </div>
        <Section title="Technologies">
          <div className="flex flex-wrap gap-2">{ticket.technologies.map((item) => <span key={item} className="inline-flex items-center gap-1.5 border border-[#d5ddd6] bg-[#f7f8f3] px-3 py-1.5 text-sm font-medium"><Code2 aria-hidden="true" size={14} />{item}</span>)}</div>
        </Section>
        <Section title="Likely files to modify">
          <div className="space-y-2">{ticket.likelyFiles.map((item) => <code key={item} className="flex items-center gap-2 overflow-x-auto bg-[#14261f] px-3 py-2.5 text-sm text-[#dff1bb]"><FileCode2 aria-hidden="true" size={15} className="shrink-0" />{item}</code>)}</div>
        </Section>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="border border-[#dbe5c6] bg-[#f7faef] p-5">
            <h2 className="flex items-center gap-2 font-semibold"><Lightbulb aria-hidden="true" size={18} className="text-[#5e7a17]" />Starting hint</h2>
            <p className="mt-3 leading-7 text-[#5d6c66]">{ticket.initialHint}</p>
          </div>
          <div className="border border-[#eadbd2] bg-[#fdf8f5] p-5">
            <h2 className="flex items-center gap-2 font-semibold"><AlertTriangle aria-hidden="true" size={18} className="text-[#b45f3e]" />Common mistakes</h2>
            <BulletList items={ticket.commonMistakes} />
          </div>
        </section>
      </div>
    </article>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Flag; label: string; value: string }) {
  return <div className="flex items-center gap-3 bg-[#f4f6f1] p-3"><Icon aria-hidden="true" size={17} className="text-[#5e7a17]" /><div><p className="text-xs text-[#66736d]">{label}</p><p className="text-sm font-semibold">{value}</p></div></div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-3 text-lg font-semibold">{title}</h2><div className="leading-7 text-[#5d6c66]">{children}</div></section>;
}

function BulletList({ items }: { items: string[] }) {
  return <ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex gap-3"><span className="mt-2.5 size-1.5 shrink-0 bg-[#678616]" /><span>{item}</span></li>)}</ul>;
}
