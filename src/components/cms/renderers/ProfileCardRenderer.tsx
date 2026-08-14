import { hasImage } from "@/lib/db";
import { DEFAULT_IMAGES } from "@/lib/default-images";

interface ProfileCardData {
  introduction: string;
  quote: string;
  imageKey: string;
  imageName: string;
  imageSubtitle: string;
}

export default function ProfileCardRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as ProfileCardData;
  const src = d.imageKey
    ? hasImage(d.imageKey)
      ? `/api/images/${d.imageKey}`
      : DEFAULT_IMAGES[d.imageKey] ?? null
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">事務所介紹</h2>
        <p className="text-stone-600 leading-relaxed mb-6">{d.introduction}</p>

        {d.quote && (
          <>
            <h3 className="text-xl font-bold text-stone-800 mb-3">服務理念</h3>
            <p className="text-stone-600 leading-relaxed italic border-l-4 border-amber-800 pl-4">
              {d.quote}
            </p>
          </>
        )}
      </div>
      <div>
        <div className="relative bg-stone-200 rounded-2xl h-64 flex items-center justify-center overflow-hidden">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={d.imageName || ""}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="text-stone-400 text-sm">地政士照片</span>
          )}
        </div>
        {d.imageName && (
          <div className="text-center mt-4">
            <p className="font-bold text-stone-800 text-lg">{d.imageName}</p>
            {d.imageSubtitle && (
              <p className="text-stone-500 text-sm">{d.imageSubtitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
