export const metadata = {
  title: "Privacy Policy · Algoryth",
};

const POLICY_SECTIONS = [
  {
    title: "1. Introduction",
    content:
      "Algoryth respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.",
  },
  {
    title: "2. Information We Collect",
    list: [
      "Account information such as username and email address",
      "Problem submissions, solutions, and activity data",
      "Usage analytics to improve platform performance",
      "Optional profile information you choose to provide",
    ],
  },
  {
    title: "3. How We Use Your Information",
    list: [
      "To provide and maintain Algoryth services",
      "To improve problem quality and platform experience",
      "To communicate important updates or notices",
      "To ensure platform security and prevent misuse",
    ],
  },
  {
    title: "4. Cookies",
    content:
      "Algoryth may use cookies or similar technologies to enhance user experience, analyze usage patterns, and maintain session integrity.",
  },
  {
    title: "5. Data Sharing",
    content:
      "We do not sell or rent your personal information. Data may only be shared if required by law or to protect the integrity of the platform.",
  },
  {
    title: "6. Data Security",
    content:
      "We implement reasonable technical and organizational measures to protect your data, but no system can guarantee absolute security.",
  },
  {
    title: "7. Your Rights",
    content:
      "You may request access, correction, or deletion of your data by contacting us through the platform or repository.",
  },
  {
    title: "8. Changes to This Policy",
    content:
      "We may update this Privacy Policy periodically. Continued use of Algoryth after changes implies acceptance.",
  },
  {
    title: "9. Contact",
    content:
      "For privacy-related questions, please open an issue or discussion on our GitHub repository.",
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

        <div className="space-y-8 px-6 py-8 text-sm leading-6 text-[#5d5245] dark:text-[#d7ccbe]">
          {POLICY_SECTIONS.map((section, index) => (
            <section key={index}>
              <h2 className="text-base font-semibold">{section.title}</h2>
              {section.content && (
                <p className="mt-2">{section.content}</p>
              )}
              {section.list && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>


      </div>
    </section>
  );
}
