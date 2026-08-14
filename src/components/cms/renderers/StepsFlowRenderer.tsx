import type { StepsFlowData } from "@/lib/cms-types";

export default function StepsFlowRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as StepsFlowData;
  const steps = d.steps ?? [];
  if (steps.length === 0) return null;

  return (
    <div>
      {d.title && (
        <h2 className="text-3xl font-bold text-stone-800 mb-12 text-center">{d.title}</h2>
      )}
      <div className="space-y-8 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-800 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 h-8 bg-stone-300 mx-auto mt-2" />
              )}
            </div>
            <div className="ml-6">
              <h3 className="text-lg font-semibold text-stone-800">{step.name}</h3>
              <p className="text-stone-600 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
