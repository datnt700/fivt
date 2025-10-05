import OpenAI from "openai";
import { NextResponse } from 'next/server';
const modelNano = "gpt-5-nano";
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
  // First, check for common greetings and casual phrases manually for reliability
  const casualKeywords = [
    'hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening',
    'bonjour', 'salut', 'bonsoir', 'xin chào', 'chào', 
    'thanks', 'thank you', 'merci', 'cảm ơn', 'спасибо',
    'how are you', 'what\'s up', 'sup', 'yo',
    'bye', 'goodbye', 'see you', 'au revoir', 'tạm biệt'
  ];
  
  const financialKeywords = [
    'money', 'budget', 'save', 'invest', 'loan', 'debt', 'credit', 'bank', 'account',
    'salary', 'income', 'expense', 'cost', 'price', 'euro', 'dollar', 'finance', 'financial',
    'retirement', 'pension', 'insurance', 'mortgage', 'rent', 'tax', 'stocks', 'bonds'
  ];
  
  const lowerPrompt = prompt.toLowerCase().trim();
  
  // Direct keyword matching for reliability
  if (casualKeywords.some(keyword => lowerPrompt.includes(keyword))) {
    console.log("Direct classification: casual for prompt:", prompt);
    return "casual";
  }
  
  if (financialKeywords.some(keyword => lowerPrompt.includes(keyword))) {
    console.log("Direct classification: financial for prompt:", prompt);
    return "financial";
  }
  
  // Only use AI classification for ambiguous cases
  try {
    const response = await client.chat.completions.create({
      model: modelNano, 
      messages: [
        {
          role: "system",
          content: `You are an intent classifier for a personal finance chatbot. 
Classify the user's message into one of these categories:

- "casual": greetings, small talk, thanks, social conversation
- "financial": any message about personal or business finance
- "unsupported": anything else, outside of finance or casual conversation.

Answer with only one word: "casual", "financial", or "unsupported".`
        },
        { role: "user", content: prompt }
      ],
      max_completion_tokens: 10, 
      stream: false
    });

    const raw = response.choices[0]?.message?.content?.trim().toLowerCase() ?? "";
    console.log("AI classification for prompt:", prompt, "raw response:", raw);

    if (raw.includes("casual")) return "casual";
    if (raw.includes("financial")) return "financial";
    if (raw.includes("unsupported")) return "unsupported";
  } catch (error) {
    console.error("AI classification failed:", error);
  }

  // Final fallback
  return "unsupported"; 
}


// Simple in-memory cache for common responses
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.response;
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key: string, response: string): void {
  responseCache.set(key, { response, timestamp: Date.now() });
}

export async function POST(req: Request) {
  try {
    const { prompt, locale } = await req.json();

    // Check cache for common responses
    const cacheKey = `${prompt.toLowerCase().trim()}-${locale}`;
    const cachedResponse = getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      console.log("Returning cached response for:", prompt);
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(cachedResponse));
          controller.close();
        },
      });
      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    // Language-specific instructions for GPT
    const languageInstructions = {
      en: "You are FIVT chatbot, a helpful financial advisor assistant. You are NOT ChatGPT or any other AI assistant - you are specifically FIVT chatbot. Please respond only in English. Provide clear, actionable financial advice with structured strategies and steps.",
      vi: "Bạn là FIVT chatbot, một trợ lý tư vấn tài chính hữu ích. Bạn KHÔNG phải là ChatGPT hay bất kỳ trợ lý AI nào khác - bạn là FIVT chatbot. Vui lòng chỉ trả lời bằng tiếng Việt. Cung cấp lời khuyên tài chính rõ ràng, có thể thực hiện với các chiến lược và bước thực hiện có cấu trúc.",
      fr: "Vous êtes FIVT chatbot, un assistant conseiller financier utile. Vous n'êtes PAS ChatGPT ou tout autre assistant IA - vous êtes spécifiquement FIVT chatbot. Veuillez répondre uniquement en français. Fournissez des conseils financiers clairs et exploitables avec des stratégies et des étapes structurées."
    };

    const languageInstruction = languageInstructions[locale as keyof typeof languageInstructions] 
      || languageInstructions.en;

    const intent = await detectIntent(prompt);
    
    // For casual and unsupported, return simple text responses
    if (intent === "casual") {
      const casualRes = await client.chat.completions.create({
        model: modelNano,
        messages: [
          {
            role: "system",
            content: `You are FIVT chatbot, a friendly financial assistant. You are NOT ChatGPT or any other AI assistant - you are specifically FIVT chatbot created to help with financial matters.
            Respond casually with a short and kind greeting. If asked about your identity, clearly state that you are FIVT chatbot.
            Always answer in ${locale === "vi" ? "Vietnamese" : locale === "fr" ? "French" : "English"}. 
            Keep it under 1-2 sentences.`
          },
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 400,
        stream: false,
      });
      
      const reply = casualRes.choices[0]?.message?.content?.trim() || getUnsupportedMessage(locale);
      
      // Cache the response
      setCachedResponse(cacheKey, reply);
      
      // Return simple streaming text response for consistency
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(reply));
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    if (intent === "unsupported") {
      const message = getUnsupportedMessage(locale);
      
      // Cache the response
      setCachedResponse(cacheKey, message);
      
      // Return simple streaming text response for consistency
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(message));
          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    const systemMessage = `${languageInstruction} 

You are FIVT chatbot, a specialized financial advisor AI assistant. You are NOT ChatGPT, Claude, or any other AI assistant - you are specifically FIVT chatbot, created to help users with their financial needs. If anyone asks about your identity, always clarify that you are FIVT chatbot.

IMPORTANT: Provide actionable, specific financial advice tailored to the user's situation. Always respond in the specified language: ${locale === 'vi' ? 'Vietnamese' : locale === 'fr' ? 'French' : 'English'}.

Guidelines for your response:
1. Start with a brief acknowledgment of their question
2. Provide 2-3 specific, actionable recommendations
3. Include practical steps they can take immediately
4. Mention any important considerations or risks
5. Keep responses under 200 words for better readability
6. Use simple, clear language without jargon

Be encouraging and supportive while maintaining professional financial advice standards.`;

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
      max_completion_tokens: 300, // Limit response length for faster responses
      temperature: 0.7, // Balance creativity with consistency
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || "";
          fullResponse += content;
          controller.enqueue(new TextEncoder().encode(content));
        }
        // Cache the complete response for financial advice
        if (fullResponse) {
          setCachedResponse(cacheKey, fullResponse);
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
