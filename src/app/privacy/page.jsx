export const metadata = {
  title: "Privacy Policy · Algoryth",
};

const SECTIONS = [
  {
    title: "1. Introduction",
    content: (
      <p>
        Algoryth respects your privacy and is committed to protecting your
        personal information. This Privacy Policy explains how we collect,
        use, and safeguard your data when you use our platform.
      </p>
    ),
  },
  {
    title: "2. Information We Collect",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Account information such as username and email address</li>
        <li>Problem submissions, solutions, and activity data</li>
        <li>Usage analytics to improve platform performance</li>
        <li>Optional profile information you choose to provide</li>
      </ul>
    ),
  },
  {
    title: "3. How We Use Your Information",
    content: (
      <ul className="list-disc pl-5 space-y-1">
        <li>To provide and maintain Algoryth services</li>
        <li>To improve problem quality and platform experience</li>
        <li>To communicate important updates or notices</li>
        <li>To ensure platform security and prevent misuse</li>
      </ul>
    ),
  },
  {
    title: "4. Cookies",
    content: (
      <p>
        Algoryth may use cookies or similar technologies to enhance user
        experience, analyze usage patterns, and maintain session integrity.
      </p>
    ),
  },
  {
    title: "5. Data Sharing",
    content: (
      <p>
        We do not sell or rent your personal information. Data may only be
        shared if required by law or to protect the integrity of the
        platform.
      </p>
    ),
  },
  {
    title: "6. Data Security",
    content: (
      <p>
        We implement reasonable technical and organizational measures to
        protect your data, but no system can guarantee absolute security.
      </p>
    ),
  },
  {
    title: "7. Your Rights",
    content: (
      <p>
        You may request access, correction, or deletion of your data by
        contacting us through the platform or repository.
      </p>
    ),
  },
  {
    title: "8. Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy periodically. Continued use of
        Algoryth after changes implies acceptance.
      </p>
    ),
  },
  {
    title: "9. Contact",
    content: (
      <p>
        For privacy-related questions, please open an issue or discussion
        on our GitHub repository.
      </p>
    ),
  },
];

export default function PrivacyPolicy() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl border border-[#e0d5c2] bg-white dark:border-[#3c3347] dark:bg-[#211d27]">

        {/* Header */}
        <div className="border-b border-[#e0d5c2] bg-[#f7f0e0] px-6 py-5 dark:border-[#3c3347] dark:bg-[#292331]">
          <h1 className="text-2xl font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-1 text-sm text-[#6f6251] dark:text-[#b5a59c]">
            Last updated: 7 January 2026
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-sm leading-6 text-[#5d5245] dark:text-[#d7ccbe] space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-semibold text-base">
                {section.title}
              </h2>
              <div className="mt-2">
                {section.content}
              </div>
            </section>
          ))}
        </div>

      </div>
    </section>
  );
}
