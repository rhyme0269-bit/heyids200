/**
 * 服務項目圖示（#32）。
 *
 * 一套線條圖示，取代原本的 emoji：同一個 24×24 畫布、1.5 stroke、圓角端點，
 * 顏色以 currentColor 繼承，因此跟著品牌色走，不需為每個圖示指定顏色。
 *
 * 資料相容：後台的圖示欄位若存的是 emoji（既有資料），仍會原樣顯示，
 * 因此切換過程中不會有圖示消失。
 */

export type ServiceIconKey =
  | "transfer"
  | "inheritance"
  | "gift"
  | "mortgage"
  | "tax"
  | "partition"
  | "trust"
  | "planning"
  | "consult"
  | "government"
  | "escrow"
  | "utility";

const P = { fill: "none", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const PATHS: Record<ServiceIconKey, React.ReactNode> = {
  /*
   * These render at 24px. A first pass packed composite metaphors into each mark
   * (a deed *and* a padlock, hands *and* a parcel) and at that size the smaller
   * element turned to mush. Rule now: at most three strokes, nothing smaller than
   * roughly a quarter of the canvas, one idea per icon.
   */

  // 買賣移轉：房屋 + 下方交換箭頭
  transfer: (
    <>
      <path {...P} d="M3 10.5 12 3.5l9 7" />
      <path {...P} d="M5.5 12v8.5h13V12" />
      <path {...P} d="M9 16.5h6l-2-2M15 16.5l-2 2" />
    </>
  ),
  // 繼承：一代傳兩代
  inheritance: (
    <>
      <circle {...P} cx="12" cy="5.5" r="2.5" />
      <path {...P} d="M12 8v3.5M6.5 15v-1.5a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 1.5 1.5V15" />
      <circle {...P} cx="6.5" cy="18" r="2.5" />
      <circle {...P} cx="17.5" cy="18" r="2.5" />
    </>
  ),
  // 贈與：禮盒
  gift: (
    <>
      <path {...P} d="M4 9h16v11.5H4z" />
      <path {...P} d="M4 13.5h16M12 9v11.5" />
      <path {...P} d="M12 9c-1-2.5-2.5-3.5-4-2.5S8 9 12 9c1-2.5 2.5-3.5 4-2.5S16 9 12 9z" />
    </>
  ),
  // 抵押權：鎖
  mortgage: (
    <>
      <rect {...P} x="4.5" y="10.5" width="15" height="10" rx="1.5" />
      <path {...P} d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <path {...P} d="M12 14.5v2.5" />
    </>
  ),
  // 房地合一稅：稅單
  tax: (
    <>
      <path {...P} d="M5.5 3.5h13v17l-3.25-2-3.25 2-3.25-2-3.25 2z" />
      <path {...P} d="M9 8.5h6M9 12.5h6" />
    </>
  ),
  // 共有物分割：一分為二
  partition: (
    <>
      <rect {...P} x="3" y="4.5" width="7.5" height="15" rx="1.5" />
      <rect {...P} x="13.5" y="4.5" width="7.5" height="15" rx="1.5" />
    </>
  ),
  // 信託：列柱建築
  trust: (
    <>
      <path {...P} d="M3 9.5 12 4l9 5.5" />
      <path {...P} d="M6.5 9.5v9M12 9.5v9M17.5 9.5v9" />
      <path {...P} d="M3.5 20.5h17" />
    </>
  ),
  // 節稅規劃：下降趨勢
  planning: (
    <>
      <path {...P} d="M3.5 4v16.5H21" />
      <path {...P} d="M7 9l4 4 3.5-3.5L19 15" />
      <path {...P} d="M19 15h-3.5M19 15v-3.5" />
    </>
  ),
  // 諮詢：對話框
  consult: (
    <>
      <path {...P} d="M4 6.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4a2.5 2.5 0 0 1-1-2z" />
    </>
  ),
  // 政府機關
  government: (
    <>
      <path {...P} d="M3 10.5h18L12 4z" />
      <path {...P} d="M6 10.5v8M18 10.5v8" />
      <path {...P} d="M2.5 20.5h19M9.5 20.5v-6h5v6" />
    </>
  ),
  // 履約保證
  escrow: (
    <>
      <path {...P} d="M12 3.5 19.5 6v6.5c0 4.3-3.2 7.7-7.5 9-4.3-1.3-7.5-4.7-7.5-9V6z" />
      <path {...P} d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  // 水電過戶
  utility: (
    <>
      <path {...P} d="M12 3.5s6 5.8 6 9.8a6 6 0 0 1-12 0c0-4 6-9.8 6-9.8z" />
    </>
  ),
};

export const SERVICE_ICON_KEYS = Object.keys(PATHS) as ServiceIconKey[];

export const SERVICE_ICON_LABELS: Record<ServiceIconKey, string> = {
  transfer: "買賣移轉",
  inheritance: "繼承",
  gift: "贈與",
  mortgage: "抵押權",
  tax: "稅務單據",
  partition: "共有物分割",
  trust: "信託",
  planning: "節稅規劃",
  consult: "諮詢",
  government: "政府機關",
  escrow: "履約保證",
  utility: "水電過戶",
};

export function isServiceIconKey(v: string): v is ServiceIconKey {
  return (SERVICE_ICON_KEYS as string[]).includes(v);
}

/**
 * 圖示欄位可能是新的圖示代號，也可能是既有的 emoji。前者畫 SVG，
 * 後者原樣輸出，這樣資料轉換期間兩種都能正常顯示。
 */
export default function ServiceIcon({ icon, className }: { icon?: string; className?: string }) {
  if (!icon) return null;

  if (isServiceIconKey(icon)) {
    return (
      <svg
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill="none"
        className={className ?? "h-6 w-6"}
        aria-hidden="true"
      >
        {PATHS[icon]}
      </svg>
    );
  }

  return <span className={`emoji-icon ${className ?? "text-xl"}`}>{icon}</span>;
}
