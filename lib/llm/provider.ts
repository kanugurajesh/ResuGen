export interface StructuredRequest {
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
}

export interface LlmProvider {
  generateStructured<T>(req: StructuredRequest): Promise<T>;
}
