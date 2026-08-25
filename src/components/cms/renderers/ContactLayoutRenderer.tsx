import { getSettings } from "@/lib/db";
import ContactForm from "@/components/common/ContactForm";
import PreviewGuard from "@/components/common/PreviewGuard";
import ContactInfoRenderer from "./ContactInfoRenderer";
import MapEmbedRenderer from "./MapEmbedRenderer";

interface ContactLayoutData {
  formTitle: string;
  infoTitle: string;
  mapEmbedUrl: string;
  googleFormUrl?: string;
}

export default function ContactLayoutRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as ContactLayoutData;
  // The office has one address and it lives in 基本資訊. This block used to keep
  // its own copy, which the seed filled in and nobody thought to update, so
  // changing the address in the admin left the map pointing at the old one (#38).
  const { address } = getSettings();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        {d.formTitle && (
          <h2 className="text-2xl font-bold text-stone-800 mb-6">{d.formTitle}</h2>
        )}
        {d.googleFormUrl ? (
          <iframe
            src={d.googleFormUrl}
            className="w-full rounded-lg border border-stone-200"
            style={{ minHeight: 600 }}
            title="聯絡表單"
          />
        ) : (
          <PreviewGuard fallbackMessage="聯絡表單需正式部署後才能使用">
            <ContactForm endpoint={getSettings().contactEndpoint} />
          </PreviewGuard>
        )}
      </div>
      <div>
        <ContactInfoRenderer data={{ title: d.infoTitle || "聯絡資訊" }} />
        <div className="mt-8">
          <MapEmbedRenderer data={{ title: "", address, embedUrl: d.mapEmbedUrl || "" }} />
        </div>
      </div>
    </div>
  );
}
