import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";

export const metadata: Metadata = {
  title: "Create a simulation",
  description: "Configure a realistic junior developer work ticket.",
};

export default function SimulatePage() {
  return (
    <main className="flex-1">
      <section className="border-b border-[#dce2dc] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#678616]">New simulation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Build your workday.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#64736d]">
            Give your AI team lead enough context to create a ticket that is useful, achievable, and right for your level.
          </p>
        </div>
      </section>
      <ProfileForm />
    </main>
  );
}
