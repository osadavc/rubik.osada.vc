import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATALOG } from "@/lib/guides/catalog";
import { GuideClient } from "./guide-client";

export const generateStaticParams = async () =>
  CATALOG.filter((entry) => entry.available).map((entry) => ({ slug: entry.slug }));

export const generateMetadata = async ({
  params,
}: PageProps<"/guides/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const entry = CATALOG.find((e) => e.slug === slug && e.available);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.tagline,
  };
};

const GuidePage = async ({ params }: PageProps<"/guides/[slug]">) => {
  const { slug } = await params;
  const entry = CATALOG.find((e) => e.slug === slug && e.available);
  if (!entry) notFound();
  return <GuideClient slug={slug} />;
};

export default GuidePage;
