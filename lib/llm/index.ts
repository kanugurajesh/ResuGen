import { LlmProvider } from "@/lib/llm/provider";
import { OpenAiProvider } from "@/lib/llm/openai";

let _provider: LlmProvider | null = null;

export function getLlmProvider(): LlmProvider {
  if (!_provider) {
    _provider = new OpenAiProvider();
  }
  return _provider;
}
