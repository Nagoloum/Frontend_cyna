import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail, MessageSquare, Send } from "lucide-react";
import { contactAPI } from "@/services/api";

export default function ContactPage() {
  const [form, setForm]       = useState({ email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus]   = useState(null); // { type: 'success'|'error', text }

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setStatus({ type: "error", text: "All fields are required." });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setStatus({ type: "error", text: "Please enter a valid email." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await contactAPI.create(form);
      const ok  = res.data?.success !== false;
      if (!ok) throw new Error(res.data?.message || "Failed to send message.");
      setStatus({ type: "success", text: "Your message has been sent. We'll get back to you soon." });
      setForm({ email: "", subject: "", message: "" });
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? "Failed to send message.";
      setStatus({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10 sm:py-14">
          <p className="section-label">Get in touch</p>
          <h1 className="section-title mb-2">Contact Us</h1>
          <p className="text-sm max-w-xl" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
            Questions about our solutions, pricing or partnership opportunities? Send us a message — we typically reply within 24 hours.
          </p>
        </div>
      </div>

      <div className="cyna-container py-10 max-w-2xl">
        <form onSubmit={handleSubmit} className="cyna-card p-6 space-y-4">
          {status && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                status.type === "error"
                  ? "bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-600"
                  : "bg-green-50 dark:bg-green-500/10 border border-green-200 text-green-600"
              }`}
            >
              {status.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
              {status.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>
              Email *
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>
              Subject *
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => set("subject")(e.target.value)}
              placeholder="How can we help?"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>
              Message *
            </label>
            <div className="relative">
              <MessageSquare size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
              <textarea
                rows={6}
                value={form.message}
                onChange={(e) => set("message")(e.target.value)}
                placeholder="Tell us about your project, question or feedback…"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-3 px-6 gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
