import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <span className="font-mono text-sm font-semibold text-[#5e7a17]">404 · TICKET NOT FOUND</span>
      <FileQuestion aria-hidden="true" size={42} className="mt-6 text-[#66736d]" />
      <h1 className="mt-5 text-3xl font-semibold tracking-tight">This task is not on the board.</h1>
      <p className="mt-3 leading-7 text-[#64736d]">The page may have moved, or the link may be incomplete.</p>
      <Link href="/" className="mt-7 inline-flex min-h-11 items-center gap-2 bg-[#14261f] px-5 font-semibold text-white hover:bg-[#29483b]"><ArrowLeft aria-hidden="true" size={17} />Back home</Link>
    </main>
  );
}
