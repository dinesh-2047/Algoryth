export const metadata = {
  title: "Terms & Conditions · Algoryth",
};

export default function TermsAndConditions() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="neo-card overflow-hidden">
        <div className="border-b-3 border-black bg-[#ff6b35] px-6 py-5 dark:border-[#a9b9db] dark:bg-[#24324a]">
          <h1 className="text-2xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
            Terms & Conditions
          </h1>
          <p className="mt-1 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
            Last updated: 7 January 2026
          </p>
        </div>

        <div className="space-y-8 px-6 py-8 text-sm leading-6 text-black/80 dark:text-[#d4deff]/80">
          <section>
            <h2 className="text-base font-black uppercase">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using Algoryth, you agree to be bound by these
              Terms and Conditions. If you do not agree, please discontinue use
              of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase">2. Use of the Platform</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Use Algoryth only for lawful purposes</li>
              <li>Do not attempt to exploit or disrupt platform services</li>
              <li>Do not plagiarize or misuse problem content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-black uppercase">3. User Content</h2>
            <p className="mt-2">
              You retain ownership of your submissions, but grant Algoryth a
              non-exclusive right to display and process them for platform
              functionality.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase">4. Intellectual Property</h2>
            <p className="mt-2">
              All platform content, branding, and problem statements are
              protected unless otherwise stated. Unauthorized reproduction is
              prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase">5. Disclaimer</h2>
            <p className="mt-2">
              Algoryth is provided “as is” without warranties of any kind. We do
              not guarantee uninterrupted or error-free operation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase">6. Limitation of Liability</h2>
            <p className="mt-2">
              Algoryth shall not be liable for any indirect, incidental, or
              consequential damages arising from platform use.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase">7. Termination</h2>
            <p className="mt-2">
              We reserve the right to suspend or terminate access for violations
              of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase">8. Changes to Terms</h2>
            <p className="mt-2">
              These terms may be updated periodically. Continued use signifies
              acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-black uppercase">9. Governing Law</h2>
            <p className="mt-2">
              These terms are governed by applicable laws, without regard to
              conflict of law principles.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
