import OpenAI from "openai";
import { NextResponse } from 'next/server';
import { RecipeFinancialJsonSchema } from "@/lib/recipeFinancialSchema";
const modelName = "gpt-5-nano";

const client = new OpenAI();

const casualKeywords = ["hi", "hello", "hey", "bonjour", "salut", "xin chào", "chào", "cảm ơn", "thanks"];
const financialKeywords = ["budget", "save", "saving", "invest", "money", "debt", "loan", "finance",
  "épargne", "investissement", "dette", "argent", "ngân sách", "tiết kiệm", "đầu tư", "nợ"];

function detectIntentRuleBased(prompt: string): "casual" | "financial" | "unsupported" {
  const text = prompt.trim().toLowerCase();

  // 1. Nhận diện chào hỏi casual
  if (/^(hi|hello|hey|bonjour|salut|xin chào|chào|cảm ơn|thanks?)/i.test(text)) {
    return "casual";
  }

  if (
    /(budget|save|saving|invest|money|debt|loan|finance|épargne|investissement|dette|argent|ngân sách|tiết kiệm|đầu tư|nợ)/i.test(
      text
    )
  ) {
    return "financial";
  }

  return "unsupported";
}



export async function POST(req: Request) {
  try {
    const { prompt, locale } = await req.json();


    // Language-specific instructions for GPT
    const languageInstructions = {
      en: "You are a helpful financial advisor assistant. Please respond only in English. Provide clear, actionable financial advice with structured strategies and steps.",
      vi: "Bạn là một trợ lý tư vấn tài chính hữu ích. Vui lòng chỉ trả lời bằng tiếng Việt. Cung cấp lời khuyên tài chính rõ ràng, có thể thực hiện với các chiến lược và bước thực hiện có cấu trúc.",
      fr: "Vous êtes un assistant conseiller financier utile. Veuillez répondre uniquement en français. Fournissez des conseils financiers clairs et exploitables avec des stratégies et des étapes structurées."
    };

    const languageInstruction = languageInstructions[locale as keyof typeof languageInstructions] 
      || languageInstructions.en;

    const intent = detectIntentRuleBased(prompt);
    if (intent === "casual") {
      return NextResponse.json({
        type: "casual",
        content:
          locale === "fr"
            ? "Bonjour 👋 Comment puis-je vous aider ?"
            : locale === "vi"
              ? "Xin chào 👋 Tôi có thể giúp gì cho bạn?"
              : "Hello 👋 How can I help you today?",
      });
    }

    if (intent === "unsupported") {
      return NextResponse.json({
        type: "unsupported",
        content:
          locale === "fr"
            ? "Désolé, je ne peux répondre qu'aux questions financières."
            : locale === "vi"
              ? "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến tài chính."
              : "Sorry, I can only answer finance-related questions.",
      });
    }

    const systemMessage = `${languageInstruction} 

You are a financial advisor AI assistant. Your role is to provide comprehensive financial advice including strategies, actionable steps, and helpful tips. Always respond in the specified language: ${locale === 'vi' ? 'Vietnamese' : locale === 'fr' ? 'French' : 'English'}.

Structure your response to include:
- A clear title for the financial advice
- A brief description of the context
- Specific strategies with detailed explanations
- Step-by-step actionable instructions
- Additional helpful tips

Always ensure your advice is practical, ethical, and appropriate for general financial planning.`;

    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: systemMessage,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recipeSchema",
          schema: RecipeFinancialJsonSchema,
        },
      },
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(new TextEncoder().encode(content));
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Erreur API:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
