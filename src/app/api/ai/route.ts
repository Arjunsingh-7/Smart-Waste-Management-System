import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Do NOT instantiate Groq at module level — it runs at build time on Vercel
// and crashes if GROQ_API_KEY is not available during the build phase.
// Always create the client lazily inside the request handler.

export async function POST(req: Request) {
  try {
    // Lazy instantiation — only runs at request time, never at build time
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const { question } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const prompt = `
You are an assistant for a smart waste management system called Waste Wizard.

System overview:
- IoT sensors track dustbin fill levels in real-time
- Dashboard shows live data, alerts, and analytics
- Alerts trigger automatically when a bin exceeds 80% fill level
- Users can manage bins, schedule collections, and view reports

Answer ONLY questions related to this waste management system.
Keep answers concise, practical, and helpful.

Question: ${question}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({
      answer: response.choices[0]?.message?.content ?? "No response generated.",
    });
  } catch (error: any) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: error.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
