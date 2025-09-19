import OpenAI from "openai";
import { NextResponse } from 'next/server';
import { RecipeFinancialJsonSchema } from "@/lib/recipeFinancialSchema";
const modelNano = "gpt-5-nano";
const modelMini = "gpt-5-mini";
const client = new OpenAI();

function getUnsupportedMessage(locale: string) {
  switch (locale) {
    case "fr":
      return "Désolé, je ne peux répondre qu'aux questions financières.";
    case "vi":
      return "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến tài chính.";
    default:
      return "Sorry, I can only answer finance-related questions.";
  }
}

async function detectIntent(prompt: string): Promise<"casual" | "financial" | "unsupported"> {
  const response = await client.chat.completions.create({
    model: modelNano, 
    messages: [
      {
        role: "system",
        content: `You are an intent classifier for a personal finance chatbot. 
Classify the user's message into one of these categories:

- "casual": greetings, small talk, thanks, social conversation (e.g., hello, hi, hey, bonjour, salut, xin chào, cảm ơn, thanks, etc.)
- "financial": any message about personal or business finance, including but not limited to:
  • Budgeting (planning income/expenses, monthly budget, tracking spending, cutting costs)
  • Saving (how to save money, where to save, savings accounts, emergency funds)
  • Investing (stocks, bonds, ETFs, real estate, retirement funds, crypto, interest rates)
  • Debt and loans (credit cards, mortgages, student loans, repayment strategies, interest calculation)
  • Income and expenses (salary, side hustles, taxes, bills, household expenses)
  • Financial planning (retirement planning, insurance, financial goals, wealth building)
  • Money management in daily life (bank accounts, transfers, currencies, financial products)
  • Questions about handling income (e.g., "I earn 2000 euros/month, what should I do?", "How should I manage my salary?", "What to do with my bonus?")
- "unsupported": anything else, outside of finance or casual conversation.

Answer with only one word: "casual", "financial", or "unsupported".`
      },
      { role: "user", content: prompt }
    ],
    max_completion_tokens: 100, 
    stream: false
  });

  const raw = response.choices[0]?.message?.content?.trim().toLowerCase() ?? "";
  console.log("detectIntent raw:", raw);

  if (raw.includes("casual")) return "casual";
  if (raw.includes("financial")) return "financial";
  if (raw.includes("unsupported")) return "unsupported";

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

    const intent = await detectIntent(prompt);
    if (intent === "casual") {
     
      const casualRes = await client.chat.completions.create({
        model: modelNano,
        messages: [
                {
                  role: "system",
                  content: `You are a friendly chatbot. 
          Respond casually with a short and kind greeting. 
          Always answer in ${locale === "vi" ? "Vietnamese" : locale === "fr" ? "French" : "English"}. 
          Keep it under 1-2 sentences.`
                },
                { role: "user", content: prompt }
              ],
        max_completion_tokens: 400,
        stream: false,
      });
      const reply = casualRes.choices[0]?.message?.content?.trim() || "";
      if (!reply) {
        return NextResponse.json({
        type: "unsupported",
        content: getUnsupportedMessage(locale),
        });
      }
      return NextResponse.json({
        type: "casual",
        content: reply,
      });
    }

    if (intent === "unsupported") {
      return NextResponse.json({
        type: "unsupported",
        content:getUnsupportedMessage(locale),
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
      model: modelNano,
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
