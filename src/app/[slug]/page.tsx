import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { getPageBySlug, getBlocksForPage, isCmsInitialized } from "@/lib/cms-db";
import BlockRenderer from "@/components/cms/BlockRenderer";
import StructuredData from "@/components/common/StructuredData";

export const dynamic = "force-dynamic";

const SKIP_SLUGS = new Set(["home", "tools"]);

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (SKIP_SLUGS.has(slug) || !isCmsInitialized()) return {};

  const page = getPageBySlug(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.metaDescription || page.subtitle || undefined,
  };
}

function buildFaqSchema(blocks: Array<{ blockType: string; data: Record<string, unknown> }>) {
  for (const block of blocks) {
    if (block.blockType !== "faq_accordion") continue;
    const items = block.data.items as Array<{ question: string; answer: string }> | undefined;
    if (!items?.length) continue;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    };
  }
  return null;
}

export default async function CmsPage({ params }: Props) {
  noStore();
  const { slug } = await params;

  if (SKIP_SLUGS.has(slug)) notFound();
  if (!isCmsInitialized()) notFound();

  const page = getPageBySlug(slug);
  if (!page || page.status !== "published") notFound();

  const blocks = getBlocksForPage(page.id);
  const faqSchema = buildFaqSchema(blocks);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      <BlockRenderer blocks={blocks} />
    </>
  );
}
