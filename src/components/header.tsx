import Link from "next/link";
import { Braces, History, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dce2dc] bg-[#f7f8f3]/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight text-[#14261f]"
          aria-label="JuniorFlow AI home"
        >
          <span className="flex size-9 items-center justify-center border border-[#14261f] bg-[#c8f169] transition-transform group-hover:-rotate-3">
            <Braces aria-hidden="true" size={19} strokeWidth={2.4} />
          </span>
          <span>JuniorFlow <span className="text-[#678616]">AI</span></span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium" aria-label="Main navigation">
          <Link
            href="/history"
            className="hidden items-center gap-2 px-3 py-2 text-[#52615b] transition-colors hover:text-[#14261f] sm:flex"
          >
            <History aria-hidden="true" size={16} />
            History
          </Link>
          <Link
            href="/simulate"
            className="inline-flex items-center gap-2 bg-[#14261f] px-4 py-2.5 text-white transition-colors hover:bg-[#29483b]"
          >
            <Sparkles aria-hidden="true" size={16} />
            Start simulation
          </Link>
        </nav>
      </div>
    </header>
  );
}
