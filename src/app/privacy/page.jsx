export const metadata = {
  title: "Privacy Policy · Algoryth",
};

export default function PrivacyPolicy() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-white dark:border-[#3c3347] dark:bg-[#211d27]">
        <div className="border-b border-[#e0d5c2] bg-[#f7f0e0] px-6 py-5 dark:border-[#3c3347] dark:bg-[#292331]">
          <h1 className="text-2xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-[#6f6251] dark:text-[#b5a59c]">
            Last updated: 7 January 2026
          </p>
        </div>

        <div className="px-6 py-8 text-sm leading-6 text-[#5d5245] dark:text-[#d7ccbe] space-y-8">
          <section>
            <h2 className="font-semibold text-base">1. Introduction</h2>
            <p className="mt-2">
              Algoryth respects your privacy and is committed to protecting your
              personal information. This Privacy Policy explains how we collect,
              use, and safeguard your data when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base">2. Information We Collect</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Account information such as username and email address</li>
              <li>Problem submissions, solutions, and activity data</li>
              <li>Usage analytics to improve platform performance</li>
              <li>Optional profile information you choose to provide</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base">3. How We Use Your Information</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>To provide and maintain Algoryth services</li>
              <li>To improve problem quality and platform experience</li>
              <li>To communicate important updates or notices</li>
              <li>To ensure platform security and prevent misuse</li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-base">4. Cookies</h2>
            <p className="mt-2">
              Algoryth may use cookies or similar technologies to enhance user
              experience, analyze usage patterns, and maintain session integrity.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base">5. Data Sharing</h2>
            <p className="mt-2">
              We do not sell or rent your personal information. Data may only be
              shared if required by law or to protect the integrity of the
              platform.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base">6. Data Security</h2>
            <p className="mt-2">
              We implement reasonable technical and organizational measures to
              protect your data, but no system can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base">7. Your Rights</h2>
            <p className="mt-2">
              You may request access, correction, or deletion of your data by
              contacting us through the platform or repository.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base">8. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy periodically. Continued use of
              Algoryth after changes implies acceptance.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base">9. Contact</h2>
            <p className="mt-2">
              For privacy-related questions, please open an issue or discussion
              on our GitHub repository.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
