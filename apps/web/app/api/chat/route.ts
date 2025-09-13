import OpenAI from "openai";
import { NextResponse } from 'next/server';
import {z} from "zod";
import {RecipeFinancialSchema} from "@/lib/recipeFinancialSchema";
const modelName = "gpt-5-nano";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const client = new OpenAI();
    const jsonSchema = z.toJSONSchema(RecipeFinancialSchema);

    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recipeSchema",
          schema: jsonSchema,
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
