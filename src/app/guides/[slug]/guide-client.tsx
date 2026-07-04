"use client";

import { notFound } from "next/navigation";
import { GuideView } from "@/components/guide/guide-view";
import { getGuide } from "@/lib/guides/registry";

/**
 * Guide data contains functions (highlight masks, goals), so it cannot cross
 * the server boundary as props. The client looks it up by slug instead.
 */
export const GuideClient = ({ slug }: { slug: string }) => {
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuideView guide={guide} />;
};
