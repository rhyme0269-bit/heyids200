"use client";

import { useState, type FormEvent } from "react";

interface FormData {
  name: string;
  phone: string;
  email: string;
  message: string;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

/**
 * 聯絡表單。
 *
 * `endpoint` 為外部收件網址（Google Apps Script），由後台設定傳入。靜態網站沒有
 * 站內 API 可用，因此正式站必須設定；留空時退回站內 /api/contact，供本機編輯時測試。
 */
export default function ContactForm({ endpoint }: { endpoint?: string }) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const external = !!endpoint;

    try {
      /*
       * Content-Type is text/plain for the external endpoint on purpose. That
       * keeps it a "simple" request, so the browser sends no CORS preflight —
       * Apps Script does not answer preflight, and a JSON content type would
       * fail before the request ever arrived.
       */
      const res = await fetch(endpoint || "/api/contact", {
        method: "POST",
        headers: { "Content-Type": external ? "text/plain;charset=utf-8" : "application/json" },
        body: JSON.stringify(formData),
      });

      /*
       * Only report success when the endpoint actually said so. If the response
       * cannot be read — opaque, blocked, or not JSON — that is an error, not a
       * success: telling someone their enquiry was sent when it may not have
       * been is worse than telling them to call.
       */
      let result: { success?: boolean; message?: string } | null = null;
      try {
        result = await res.json();
      } catch {
        result = null;
      }

      if (res.ok && result?.success) {
        setStatus("success");
        setFormData({ name: "", phone: "", email: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(
          result?.message ||
            "送出失敗，請改用電話或 LINE 與我們聯繫，以免您的訊息未送達。"
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage("送出失敗，請確認網路連線，或改用電話或 LINE 與我們聯繫。");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg bg-stone-50 border border-stone-200 p-8 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-amber-800"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-stone-800 mb-2">
          諮詢已成功送出
        </h3>
        <p className="text-stone-600 text-sm">
          感謝您的來信，我們將盡快與您聯繫。
        </p>
        <button
          type="button"
          className="mt-4 text-sm text-amber-800 hover:text-amber-900 font-medium underline transition-colors"
          onClick={() => setStatus("idle")}
        >
          再次填寫
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 姓名 */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          姓名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="請輸入您的姓名"
          className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-800 placeholder:text-stone-400 focus:border-amber-800 focus:ring-1 focus:ring-amber-800 outline-none transition-colors"
        />
      </div>

      {/* 電話 */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          電話 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          value={formData.phone}
          onChange={handleChange}
          placeholder="請輸入您的聯絡電話"
          className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-800 placeholder:text-stone-400 focus:border-amber-800 focus:ring-1 focus:ring-amber-800 outline-none transition-colors"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Email <span className="text-stone-400 text-xs">（選填）</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="請輸入您的 Email"
          className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-800 placeholder:text-stone-400 focus:border-amber-800 focus:ring-1 focus:ring-amber-800 outline-none transition-colors"
        />
      </div>

      {/* 諮詢內容 */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          諮詢內容 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="請簡述您的需求或問題"
          className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-800 placeholder:text-stone-400 focus:border-amber-800 focus:ring-1 focus:ring-amber-800 outline-none transition-colors resize-vertical"
        />
      </div>

      {/* Error Message */}
      {status === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-amber-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {status === "submitting" ? "送出中..." : "送出諮詢"}
      </button>
    </form>
  );
}
