"use client";

import dynamic from "next/dynamic";

const FAQChatbot = dynamic(() => import("./FAQChatbot"), { ssr: false, loading: () => null });

export default function FAQChatbotClient() {
  return <FAQChatbot />;
}
