import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { getPageBySlug, getBlocksForPage, isCmsInitialized } from "@/lib/cms-db";
import BlockRenderer from "@/components/cms/BlockRenderer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isCmsInitialized()) return {};

  const page = getPageBySlug(slug);
  if (!page || page.isSystem) return {};

  return {
    title: page.title,
    description: page.metaDescription || page.subtitle || undefined,
  };
}

export default async function UserPage({ params }: Props) {
  noStore();
  const { slug } = await params;

  if (!isCmsInitialized()) notFound();

  const page = getPageBySlug(slug);
  if (!page || page.status !== "published") notFound();
  if (page.isSystem) notFound();

  const blocks = getBlocksForPage(page.id);

  return <BlockRenderer blocks={blocks} />;
}
