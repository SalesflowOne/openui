export type LlmProviderConfig = {
  apiKey: string;
  chatCompletionsUrl: string;
  headers: (referer: string, title: string) => Record<string, string>;
  resolveModel: (model: string) => string;
};

export function resolveLlmProvider(): LlmProviderConfig | null {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey) {
    return {
      apiKey: openRouterKey,
      chatCompletionsUrl: "https://openrouter.ai/api/v1/chat/completions",
      headers: (referer, title) => ({
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": title,
      }),
      resolveModel: (model) => model,
    };
  }

  const openAIKey = process.env.OPENAI_API_KEY;
  if (openAIKey) {
    return {
      apiKey: openAIKey,
      chatCompletionsUrl: "https://api.openai.com/v1/chat/completions",
      headers: () => ({
        Authorization: `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      }),
      resolveModel: (model) => {
        const slash = model.indexOf("/");
        const provider = slash === -1 ? "openai" : model.slice(0, slash);
        const name = slash === -1 ? model : model.slice(slash + 1);
        if (provider !== "openai") {
          return "gpt-4o";
        }
        return name;
      },
    };
  }

  return null;
}

export function missingLlmProviderError(): Response {
  return Response.json(
    {
      error: {
        message:
          "No LLM API key configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY.",
      },
    },
    { status: 500 },
  );
}
