import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, X, ChevronLeft, Shield } from "lucide-react";

const QUESTIONS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];

export default function ChatBot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bodyRef = useRef(null);
  const answerRef = useRef(null);

  const handleQuestion = (key) => {
    setSelected(key);
    setShowAnswer(false);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setShowAnswer(true);
    }, 900);
  };

  const handleBack = () => {
    setSelected(null);
    setShowAnswer(false);
    setIsTyping(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSelected(null);
      setShowAnswer(false);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (showAnswer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showAnswer]);

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleToggle}
      />

      {/* Chat window */}
      <div
        className={`fixed z-50 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden transition-all duration-300 ease-out origin-bottom-right
          bottom-24 right-4 w-[calc(100vw-2rem)] sm:right-6 sm:w-96
          ${isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-3 pointer-events-none"
          }`}
        style={{ boxShadow: "var(--shadow-lg), 0 0 0 1px var(--border)" }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, var(--accent) 0%, #5b21b6 100%)" }}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">{t("chatbot.title")}</p>
            <p className="text-white/70 text-xs">{t("chatbot.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <button
              onClick={handleToggle}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors duration-200"
              aria-label={t("chatbot.close")}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          className="px-4 py-4 space-y-3 overflow-y-auto"
          style={{ maxHeight: "min(420px, calc(100dvh - 220px))" }}
        >
          {/* Welcome bubble */}
          <div className="flex items-start gap-2">
            <BotAvatar />
            <div
              className="px-3 py-2 rounded-xl rounded-tl-none text-sm leading-snug max-w-[85%]"
              style={{ background: "var(--bg-subtle)", color: "var(--text-primary)" }}
            >
              {t("chatbot.welcome")}
            </div>
          </div>

          {/* Questions list */}
          {!selected && (
            <div className="space-y-2">
              <p className="text-xs font-semibold px-1" style={{ color: "var(--text-muted)" }}>
                {t("chatbot.questions_label")}
              </p>
              {QUESTIONS.map((key, i) => (
                <button
                  key={key}
                  onClick={() => handleQuestion(key)}
                  className="w-full text-left px-3 py-2.5 rounded-xl border text-sm leading-snug transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    background: "var(--bg-card)",
                    animationDelay: `${i * 40}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.background = "var(--accent-light)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }}
                >
                  {t(`chatbot.${key}`)}
                </button>
              ))}
            </div>
          )}

          {/* Conversation view */}
          {selected && (
            <div className="space-y-3">
              {/* User question */}
              <div className="flex justify-end">
                <div
                  className="px-3 py-2 rounded-xl rounded-tr-none text-sm leading-snug max-w-[85%]"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  {t(`chatbot.${selected}`)}
                </div>
              </div>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <BotAvatar />
                  <div
                    className="px-3 py-3 rounded-xl rounded-tl-none"
                    style={{ background: "var(--bg-subtle)" }}
                  >
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full animate-bounce"
                          style={{
                            background: "var(--accent)",
                            animationDelay: `${i * 160}ms`,
                            animationDuration: "900ms",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Answer */}
              {showAnswer && (
                <>
                  <div
                    ref={answerRef}
                    className="flex items-start gap-2"
                    style={{ animation: "chatFadeUp 0.3s ease-out both" }}
                  >
                    <BotAvatar />
                    <div
                      className="px-3 py-2 rounded-xl rounded-tl-none text-sm leading-relaxed max-w-[85%]"
                      style={{ background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                    >
                      {t(`chatbot.a${selected.slice(1)}`)}
                    </div>
                  </div>

                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-xs font-medium transition-colors duration-200 hover:opacity-80 mt-1"
                    style={{ color: "var(--accent)" }}
                  >
                    <ChevronLeft size={13} />
                    {t("chatbot.back")}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-4 py-2 flex items-center justify-center border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {t("chatbot.powered_by")}{" "}
            <span className="font-semibold" style={{ color: "var(--accent)" }}>
              Cyna
            </span>
          </p>
        </div>
      </div>

      {/* Floating toggle button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_8px_24px_rgba(124,58,237,0.45)] transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ background: "var(--accent)", focusRingColor: "var(--accent)" }}
        aria-label={isOpen ? t("chatbot.close") : t("chatbot.open")}
      >
        {/* Icon swap with rotation */}
        <span
          className="absolute transition-all duration-300"
          style={{
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
          }}
        >
          <MessageCircle size={22} />
        </span>
        <span
          className="absolute transition-all duration-300"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
          }}
        >
          <X size={22} />
        </span>
      </button>

      <style>{`
        @keyframes chatFadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

function BotAvatar() {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
      style={{ background: "var(--accent-light)" }}
    >
      <Shield size={13} style={{ color: "var(--accent)" }} />
    </div>
  );
}
