import { useApiKey } from "@/hooks/useApiKey";

export function getAnthropicClient(apiKey: string | null) {
  if (!apiKey) {
    throw new Error("API key is required");
  }
  
  return {
    analyzePrompt: async (content: string) => {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: "claude-3-5-haiku-20240307",
            max_tokens: 1024,
            temperature: 0.2,
            system: "You analyze prompts for potential misalignments between human intent and LLM interpretation.",
            messages: [
              {
                role: "user",
                content: `
                  Analyze this prompt segment for potential misalignments between human intent and LLM interpretation. 
                  Respond with a JSON array where each object contains:
                  
                  1. "text": The specific text containing the potential misalignment
                  2. "category": One of [AMBIGUOUS_INSTRUCTION, UNDERSPECIFIED_PARAMETERS, CAPABILITY_ASSUMPTION, CONFLICTING_DIRECTIVES]
                  3. "suggestion": A single concrete rewrite suggestion
                  
                  Only include substantive issues that would affect even state-of-the-art models.
                  
                  Prompt segment to analyze: ${content}
                `
              }
            ]
          })
        });
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return data.content[0].text; // Assuming this is where the JSON response is
      } catch (error) {
        console.error("Error analyzing prompt:", error);
        throw error;
      }
    }
  };
}