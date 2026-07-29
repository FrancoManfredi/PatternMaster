import { notFound } from "next/navigation";
import { getPatternBySlug, getAllPatterns } from "@/content";
import PatternDetailClient from "./PatternDetailClient";

export function generateStaticParams() {
  return getAllPatterns().map((p) => ({ slug: p.slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PatternPage({ params }: PageProps) {
  const { slug } = await params;
  const pattern = getPatternBySlug(slug);

  if (!pattern) {
    notFound();
  }

  return <PatternDetailClient pattern={pattern} />;
}
