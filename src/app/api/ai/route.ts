import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const wasteData = {
      bins: [
        { id: 1, level: 90, location: "Area A" },
        { id: 2, level: 40, location: "Area B" },
        { id: 3, level: 75, location: "Area C" },
      ],
    };

    // ✅ ADD HERE (inside function)
    const criticalBins = wasteData.bins.filter(b => b.level > 80);

    // ✅ SAFETY CHECK (VERY IMPORTANT)
    if (criticalBins.length === 0) {
      return NextResponse.json({
        answer: `
1. Critical bins:
No critical bins.

2. Recommended actions:
No immediate action required.

3. Reason:
All bins are below 80%.
`
      });
    }

    const prompt = `
You are an assistant for a smart waste management system.

System:
- IoT sensors track bin levels
- Dashboard shows real-time data
- Alerts trigger when bin >80%
- AI helps analyze and guide users

Answer ONLY about this system.
Keep answers simple and helpful.

Question: ${question}
`;
    
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({
      answer: response.choices[0]?.message?.content,
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}