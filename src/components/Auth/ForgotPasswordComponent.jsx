import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authAPI } from "@/services/api";
import { notify } from "@/components/ui/feedback";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      const data = res.data;
      if (!data?.success) {
        notify.error(
          t("forgotPassword.request_failed"),
          data?.message || t("forgotPassword.send_error"),
        );
        return;
      }
      setIsSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message ?? t("forgotPassword.send_error");
      notify.error(t("forgotPassword.request_failed"), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg-base)" }}
    >
      <div
        className="rounded-3xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Image */}
        <div className="md:w-1/2 w-full">
          <img
            src="./images/img.jpg"
            alt={t("forgotPassword.title")}
            className="w-full h-full object-cover md:rounded-l-3xl md:rounded-tr-none rounded-t-3xl"
          />
        </div>

        {/* Form */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-10 md:p-12">
          <div className="w-full max-w-md flex flex-col">
            <div className="flex flex-col lg:items-start items-center mb-8">
              <div className="flex flex-row items-center justify-center gap-8 mb-1">
                <img
                  src="/logo.png"
                  alt="Cyna"
                  className="w-14 h-14 object-contain"
                />
                <h2
                  className="text-3xl font-semibold text-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("forgotPassword.title")}
                </h2>
              </div>
            </div>

            <p
              className="text-sm lg:text-start text-center mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              {t("forgotPassword.subtitle")}
            </p>

            {isSubmitted ? (
              <div className="text-center py-0">
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(16,185,129,.12)",
                    border: "1px solid rgba(16,185,129,.25)",
                  }}
                >
                  <svg
                    className="w-10 h-10"
                    style={{ color: "var(--success)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {t("forgotPassword.check_email_title")}
                </h3>
                <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
                  {t("forgotPassword.sent_to")}{" "}
                  <span className="font-medium">{email}</span>
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {t("forgotPassword.click_link")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  className="flex items-center w-full h-14 rounded-full overflow-hidden pl-6 gap-3 transition-all duration-300 focus-within:border-[var(--accent)]"
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <svg
                    width="18"
                    height="14"
                    viewBox="0 0 16 11"
                    fill="none"
                    style={{ color: "var(--text-muted)", flexShrink: 0 }}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                      fill="currentColor"
                    />
                  </svg>
                  <input
                    type="email"
                    placeholder={t("forgotPassword.email_placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent outline-none text-base w-full"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "'Kumbh Sans', sans-serif",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-full text-white font-medium shadow-[var(--shadow-accent)] transition-all duration-200 hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ background: "var(--accent)" }}
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("forgotPassword.sending")}
                    </span>
                  ) : (
                    t("forgotPassword.send_link")
                  )}
                </button>
              </form>
            )}

            <p className="text-center mt-10">
              <Link
                to="/auth"
                className="font-medium hover:underline transition-colors duration-200"
                style={{ color: "var(--accent)" }}
              >
                {t("forgotPassword.back_to_login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
