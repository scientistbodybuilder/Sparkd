import { GoogleGenAI } from "@google/genai";

if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY is not set. Gemini API calls will fail.");
}

const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY || ""});

// export const geminiModel = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash"
// });

export type GeneratedQuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export async function generateQuizFromPdfText(
  text: string,
  comprehensionLevel: string
): Promise<GeneratedQuizQuestion[] | null> {
  const prompt = `
You are a learning assistant. Based ONLY on the content below, generate multiple-choice questions.

Each question MUST:
- Be clear and focused on key concepts from the text.
- Have exactly 4 answer options.
- Specify which option index (0-3) is correct.
- Adapt difficulty based on the specified comprehension level: ${comprehensionLevel}.

Return STRICTLY valid JSON with this TypeScript shape:
{
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": number
    },
    ...
  ]
}

Do NOT include any markdown, commentary, or code fences. Only JSON.

--- SOURCE TEXT START ---
${text.slice(0, 12000)}
--- SOURCE TEXT END ---
`;

  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents:  prompt 
  });
  const responseText = result.text;
  console.log('gemini repsonse text: ', responseText)
  if (responseText) {
    const parsed = JSON.parse(responseText);
    const questions: GeneratedQuizQuestion[] = (parsed as any).questions.map(
      (q: any, idx: number) => {
        if (
          !q ||
          typeof q.question !== "string" ||
          !Array.isArray(q.options) ||
          q.options.length !== 4
        ) {
          throw new Error(`Invalid question at index ${idx}`);
        }
        const correctIndex =
          typeof q.correctIndex === "number" ? q.correctIndex : 0;
        return {
          question: q.question,
          options: q.options.map(String),
          correctIndex:
            correctIndex >= 0 && correctIndex < 4 ? correctIndex : 0,
        };
      }
    );
    return questions;
  } else {
    return null
  }
  
}

