import Link from "next/link";
import type { KeyValueListData } from "@/lib/cms-types";
import ServiceIcon from "@/components/common/ServiceIcon";

export type ServiceCardItem = KeyValueListData["items"][number];

// 32px padding, 20px radius per the brand spec (#25).
const BASE_CLASS = "relative p-8 rounded-[20px] bg-white border overflow-hidden";

/*
 * Clickable and static cards are told apart before you touch them (#41).
 *
 * Previously every card got the same border, the same hover lift and the same
 * corner number, so on /services the one card that leads somewhere looked exactly
 * like the eight that do not. Worse, the lift-on-hover was on the static cards
 * too, which reads as "this is a button" — the affordance was actively wrong, and
 * on a touch screen there is no hover to correct the impression.
 *
 * So the resting state carries the signal: a stronger border, an arrow instead of
 * the item number, and a labelled action at the foot of the card. Hover motion and
 * the underline sweep are now reserved for cards that really do go somewhere.
 */
const CLICKABLE_CLASS =
  `${BASE_CLASS} group hover-lift block border-stone-300 ` +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/60 focus-visible:ring-offset-2";
const STATIC_CLASS = `${BASE_CLASS} border-stone-200/70`;

function CardBody({
  item,
  index,
  kind,
}: {
  item: ServiceCardItem;
  index: number;
  kind: "internal" | "external" | "static";
}) {
  const clickable = kind !== "static";

  return (
    <>
      <span
        className={
          "absolute top-4 right-4 text-xs font-mono " +
          (clickable ? "text-amber-700" : "text-stone-300")
        }
        aria-hidden="true"
      >
        {kind === "external" ? "↗" : kind === "internal" ? "→" : String(index + 1).padStart(2, "0")}
      </span>

      <div
        className={
          "w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors " +
          (clickable
            ? "bg-amber-50 text-amber-800 group-hover:bg-amber-100"
            : "bg-stone-100 text-stone-500")
        }
      >
        {item.icon ? (
          <ServiceIcon icon={item.icon} className="h-6 w-6" />
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        )}
      </div>

      <h3 className="text-lg font-semibold text-stone-800 mb-2">{item.label}</h3>
      <p className="text-stone-500 text-sm leading-relaxed">{item.value}</p>

      {clickable && (
        <p className="mt-4 text-sm font-medium text-amber-800">
          {kind === "external" ? "前往網站" : "查看詳細"}
          <span aria-hidden="true" className="ml-1 inline-block transition-transform group-hover:translate-x-1">
            {kind === "external" ? "↗" : "→"}
          </span>
        </p>
      )}

      {clickable && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
      )}
    </>
  );
}

/**
 * Card used for key_value_list items. Shared by the CMS renderer (/services,
 * /links) and the homepage services preview so both stay visually identical and
 * both honour the icon set in the page builder.
 */
export default function ServiceCard({ item, index }: { item: ServiceCardItem; index: number }) {
  // A url starting with "/" is a page on this site — route it through next/link
  // instead of opening a new tab. This is what lets a service point at a detail
  // page (e.g. a process flow) by filling in the url field alone, no code change.
  const isInternal = !!item.url && item.url.startsWith("/");

  if (isInternal) {
    return (
      <Link href={item.url!} className={CLICKABLE_CLASS}>
        <CardBody item={item} index={index} kind="internal" />
      </Link>
    );
  }

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className={CLICKABLE_CLASS}>
        <CardBody item={item} index={index} kind="external" />
      </a>
    );
  }

  return (
    <div className={STATIC_CLASS}>
      <CardBody item={item} index={index} kind="static" />
    </div>
  );
}
