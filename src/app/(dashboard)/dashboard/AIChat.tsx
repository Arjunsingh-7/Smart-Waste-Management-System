"use client";

import { useState } from "react";

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const sendMessage = async (question?: string) => {
    const q = question || input;

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: q }),
    });

    const data = await res.json();

    setMessages([...messages, { user: q, bot: data.answer }]);
    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🤖 AI Waste Assistant</h2>

      {/* Quick buttons */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => sendMessage("Which bins need urgent attention?")}>
          Urgent Bins
        </button>
        <button onClick={() => sendMessage("What should I prioritize today?")}>
          Today Priority
        </button>
      </div>

      {/* Messages */}
      <div>
        {messages.map((msg, i) => (
          <div key={i}>
            <p><b>You:</b> {msg.user}</p>
            <p><b>AI:</b> {msg.bot}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
      />
      <button onClick={() => sendMessage()}>Send</button>
    </div>
  );
}