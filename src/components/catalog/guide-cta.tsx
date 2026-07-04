import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

/** Call to action for the featured guide. */
export const GuideCta = ({ slug }: { slug: string }) => (
  <div className="flex items-center gap-5 pt-1">
    <Link
      href={`/guides/${slug}`}
      className="group inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-50 transition-[background-color,transform] duration-150 ease-out hover:bg-zinc-700 active:scale-[0.97]"
    >
      Start solving
      <ArrowRightIcon
        size={15}
        weight="bold"
        className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
      />
    </Link>
  </div>
);
