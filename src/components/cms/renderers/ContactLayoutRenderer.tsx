import ContactForm from "@/components/common/ContactForm";
import PreviewGuard from "@/components/common/PreviewGuard";
import ContactInfoRenderer from "./ContactInfoRenderer";
import MapEmbedRenderer from "./MapEmbedRenderer";

interface ContactLayoutData {
  formTitle: string;
  infoTitle: string;
  mapAddress: string;
  mapEmbedUrl: string;
  googleFormUrl?: string;
}

export default function ContactLayoutRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as ContactLayoutData;

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
            <ContactForm />
          </PreviewGuard>
        )}
      </div>
      <div>
        <ContactInfoRenderer data={{ title: d.infoTitle || "聯絡資訊" }} />
        <div className="mt-8">
          <MapEmbedRenderer data={{ title: "", address: d.mapAddress || "", embedUrl: d.mapEmbedUrl || "" }} />
        </div>
      </div>
    </div>
  );
}
