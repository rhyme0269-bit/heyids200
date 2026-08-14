import type { MapEmbedData } from "@/lib/cms-types";

export default function MapEmbedRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as MapEmbedData;
  const address = d.address || d.embedUrl;

  if (!address) return null;

  const src = d.embedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(d.address)}&output=embed&hl=zh-TW`;

  return (
    <div>
      {d.title && (
        <h2 className="text-2xl font-bold text-stone-800 mb-6">{d.title}</h2>
      )}
      <div className="rounded-xl overflow-hidden shadow-sm">
        <iframe
          src={src}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="地圖"
        />
      </div>
    </div>
  );
}
