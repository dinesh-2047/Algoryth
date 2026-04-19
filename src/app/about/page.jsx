export const metadata = {
  title: 'About | Algoryth',
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header className="neo-card px-6 py-8">
        <h1 className="text-3xl font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
          About Algoryth
        </h1>
        <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
          A coding practice platform focused on clean UI, fast feedback loops, and consistent progress.
        </p>
      </header>

      <div className="neo-card px-6 py-6">
        <p className="text-base font-black uppercase tracking-wide text-black dark:text-[#eef3ff]">
          Created by Dinesh Bhardwaj.
        </p>
      </div>
    </section>
  );
}
