import type { ContactFormData } from "@/lib/cms-types";
import ContactForm from "@/components/common/ContactForm";
import PreviewGuard from "@/components/common/PreviewGuard";

export default function ContactFormRenderer({ data }: { data: Record<string, unknown> }) {
  const d = data as unknown as ContactFormData;

  return (
    <div>
      {d.title && (
        <h2 className="text-2xl font-bold text-stone-800 mb-6">{d.title}</h2>
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
  );
}
