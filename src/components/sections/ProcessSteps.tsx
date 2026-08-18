const STEPS = [
  { label: "免費諮詢", description: "電話、LINE 或親臨事務所，先了解您的狀況" },
  { label: "需求了解", description: "確認案件類型、時程與應備文件" },
  { label: "文件準備", description: "協助備齊權狀、身分文件與各項證明" },
  { label: "送件辦理", description: "代為申報稅賦並向地政機關送件" },
  { label: "完成交付", description: "取得新權狀，點交並確認權益無誤" },
];

/**
 * The five-step overview of how a case runs, sitting before the service list on
 * the homepage. Horizontal on desktop, stacked on mobile — a single flex
 * direction switch, with the connector drawn per orientation.
 */
export default function ProcessSteps() {
  return (
    <section className="bg-stone-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-stone-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">Process</span>
            <div className="h-px w-8 bg-stone-300" />
          </div>
          <h2 className="mb-4 text-3xl font-bold text-stone-800 md:text-4xl">服務流程</h2>
          <p className="mx-auto max-w-2xl text-stone-500">從第一次諮詢到完成交付，每一步都有專人說明</p>
        </div>

        <ol className="flex flex-col gap-8 md:flex-row md:gap-4">
          {STEPS.map((step, i) => (
            <li key={step.label} className="relative flex flex-1 gap-5 md:flex-col md:gap-0 md:text-center">
              {/* Marker column — also draws the connector to the next step */}
              <div className="relative flex flex-shrink-0 flex-col items-center md:mb-5 md:w-full md:flex-row md:justify-center">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-amber-800/20 bg-white text-sm font-bold text-amber-800 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i < STEPS.length - 1 && (
                  <>
                    {/* vertical on mobile, horizontal on desktop */}
                    <span className="w-px flex-1 bg-stone-200 md:hidden" aria-hidden="true" />
                    <span className="absolute left-1/2 top-1/2 hidden h-px w-full -translate-y-1/2 bg-stone-200 md:block" aria-hidden="true" />
                  </>
                )}
              </div>

              <div className="pb-2 md:pb-0">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-stone-400">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mb-2 text-lg font-semibold text-stone-800">{step.label}</h3>
                <p className="text-sm leading-relaxed text-stone-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
