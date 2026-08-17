import OpenAI from "openai";
import { LlmProvider, StructuredRequest } from "@/lib/llm/provider";
import { ApiError } from "@/lib/api";

export class OpenAiProvider implements LlmProvider {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new ApiError(
        500,
        "OPENAI_API_KEY is not configured. Add it to your .env file."
      );
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  async generateStructured<T>(req: StructuredRequest): Promise<T> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: req.schemaName,
          schema: req.schema,
          strict: true,
        },
      },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new ApiError(502, "The AI provider returned an empty response.");
    }
    try {
      return JSON.parse(content) as T;
    } catch {
      throw new ApiError(502, "The AI provider returned malformed JSON.");
    }
  }
}
