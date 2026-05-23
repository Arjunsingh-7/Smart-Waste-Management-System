"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Bot, User, HelpCircle, Mail } from "lucide-react";
import { usePathname } from "next/navigation";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  isContact?: boolean;
}

type Message = {
  sender: "bot" | "user";
  text: string;
  isContact?: boolean;
};

/* ─── FAQ Data ───────────────────────────────────────────────────────── */
const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    question: "How does this system work?",
    answer:
      "Waste Wizard uses IoT sensors, GSM communication, backend APIs, and a real-time dashboard to monitor smart dustbins and generate alerts when wet or dry waste reaches threshold level.",
  },
  {
    id: 2,
    question: "How to register?",
    answer:
      "Click on \"Get Started\", create your organization account, verify your email, and access your smart waste monitoring dashboard.",
  },
  {
    id: 3,
    question: "What hardware is required?",
    answer:
      "Recommended hardware includes Arduino Uno, ultrasonic sensors, moisture sensors, GSM modules, and servo motors.",
  },
  {
    id: 4,
    question: "How do notifications work?",
    answer:
      "When wet or dry waste level exceeds 75%, the backend automatically generates alerts and updates the dashboard in real time.",
  },
  {
    id: 5,
    question: "Future scope of this system?",
    answer:
      "Future improvements may include AI-based waste prediction, route optimization, and advanced smart city analytics.",
  },
  {
    id: 6,
    question: "Contact Support",
    answer: "For support or demo requests: wastewizard24@gmail.com",
    isContact: true,
  },
];

const GREETING: Message = {
  sender: "bot",
  text: "Hi! I'm the Waste Wizard Assistant. Select a question below and I'll answer instantly.",
};

/* ─── Component ──────────────────────────────────────────────────────── */
export default function FAQChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Only show on landing page
  if (pathname !== '/') {
    return null;
  }

  /* Auto-scroll to latest message */
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleFAQClick = (item: FAQItem) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: item.question },
    ]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: item.answer, isContact: item.isContact },
      ]);
    }, 300);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setMessages([GREETING]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">

      {/* ── Floating Toggle Button ────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Open FAQ Assistant"
          className="relative flex items-center justify-center w-16 h-16 rounded-full
            bg-gradient-to-br from-emerald-500 to-emerald-600
            shadow-lg hover:shadow-emerald-500/40 hover:shadow-xl
            transition-all duration-300 hover:scale-110 active:scale-95 group"
        >
          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-30 pointer-events-none" />
          <span className="absolute inset-0 rounded-full animate-pulse bg-emerald-400 opacity-20 pointer-events-none" />
          <MessageSquare className="w-7 h-7 text-white transition-transform duration-300 group-hover:rotate-6 relative z-10" />
        </button>
      )}

      {/* ── Chat Window ──────────────────────────────────────── */}
      {isOpen && (
        <div
          className="
            w-[380px] max-h-[600px] flex flex-col
            bg-white/90 backdrop-blur-md
            border border-slate-200
            rounded-2xl shadow-2xl
            animate-in slide-in-from-bottom-4 fade-in duration-300
            overflow-hidden
          "
          style={{ maxHeight: "min(600px, calc(100vh - 100px))" }}
        >

          {/* ── Header ─────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur-sm border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 leading-tight">Waste Wizard Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span className="text-xs text-emerald-600 font-medium">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Messages ───────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-slate-50/40">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}
                  animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-md shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700 rounded-tl-md shadow-sm"
                  }`}
                >
                  {msg.isContact ? (
                    <span>
                      For support or demo requests:{" "}
                      <a
                        href="mailto:wastewizard24@gmail.com"
                        className="text-emerald-600 font-semibold underline underline-offset-2"
                      >
                        wastewizard24@gmail.com
                      </a>
                    </span>
                  ) : (
                    msg.text
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* ── FAQ Chips ──────────────────────────────────── */}
          <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Frequently Asked
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {FAQ_DATA.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleFAQClick(item)}
                  className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-full border
                    transition-all duration-200 hover:scale-105 active:scale-95 ${
                      item.isContact
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
                    }`}
                >
                  {item.isContact && <Mail className="w-3 h-3" />}
                  {item.question}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
