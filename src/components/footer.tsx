import Link from "next/link";
import { Braces } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#dce2dc] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[#64736d] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2 font-medium text-[#14261f]">
          <Braces aria-hidden="true" size={18} />
          JuniorFlow AI
        </div>
        <p>Built for OpenAI Build Week 2026 · Education</p>
        <div className="flex gap-5">
          <Link className="hover:text-[#14261f]" href="/history">History</Link>
          <Link className="hover:text-[#14261f]" href="/demo">Demo ticket</Link>
        </div>
      </div>
    </footer>
  );
}
