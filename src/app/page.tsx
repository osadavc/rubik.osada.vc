import { GuideCta } from "@/components/catalog/guide-cta";
import { HeroCube } from "@/components/cube/hero-cube";
import { CATALOG } from "@/lib/guides/catalog";

const DIFFICULTY_LABEL = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export default function Home() {
  const featured = CATALOG.filter((entry) => entry.available);
  const upcoming = CATALOG.filter((entry) => !entry.available);

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pb-24">
        <section className="pb-14 pt-16 sm:pt-24">
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Learn to solve the cube.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-zinc-500">
            Interactive guides built around a cube you can turn, scrub, and
            practice on, right in the page.
          </p>
        </section>

        <section className="space-y-10">
          {featured.map((entry) => (
            <div
              key={entry.slug}
              className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 sm:p-7"
            >
              {/* Text reserves the bottom-right corner on mobile so the cube can
                  bleed out of it, echoing the desktop right-edge crop. */}
              <div className="relative z-10 max-w-sm space-y-3 pb-36 sm:pb-0">
                <div className="flex gap-4 text-xs font-medium text-zinc-400">
                  <span>{entry.puzzle}</span>
                  <span>{DIFFICULTY_LABEL[entry.difficulty]}</span>
                  <span>about {entry.estMinutes} min</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                  {entry.title}
                </h2>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {entry.tagline}
                </p>
                <GuideCta slug={entry.slug} />
              </div>
              <HeroCube
                size={entry.puzzle === "4x4" ? 4 : 3}
                className="pointer-events-none absolute -bottom-24 -right-24 size-96 sm:-right-32 sm:bottom-auto sm:top-1/2 sm:h-112 sm:w-md sm:-translate-y-1/2"
              />
            </div>
          ))}

          <div className="divide-y divide-zinc-200 border-y border-zinc-200">
            {upcoming.map((entry) => (
              <div
                key={entry.slug}
                className="flex items-center justify-between gap-6 py-6"
              >
                <div className="space-y-1">
                  <p className="font-medium text-zinc-400">{entry.title}</p>
                  <p className="max-w-md text-sm leading-relaxed text-zinc-400/80">
                    {entry.tagline}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-zinc-400">
                  Coming soon
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex h-16 w-full max-w-4xl items-center justify-end px-6 text-xs text-zinc-400">
        <a
          href="https://osada.vc"
          className="transition hover:text-zinc-900"
          target="_blank"
          rel="noopener noreferrer"
        >
          osada.vc
        </a>
      </footer>
    </div>
  );
}
