import { useApiKey } from "@/hooks/useApiKey";

// Define error types for better error handling
export class AnthropicApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AnthropicApiError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export function getAnthropicClient(apiKey: string | null) {
  if (!apiKey) {
    throw new Error("API key is required");
  }
  
  return {
    analyzePrompt: async (content: string) => {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // Use our own API route instead of calling Anthropic directly
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            apiKey
          }),
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorMessage = "API request failed";
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If we can't parse the error as JSON, just use the status text
            errorMessage = `${errorMessage}: ${response.statusText}`;
          }
          
          // Handle different error status codes
          if (response.status === 429) {
            throw new AnthropicApiError("Rate limit exceeded. Please try again later.", response.status);
          } else if (response.status === 401) {
            throw new AnthropicApiError("Invalid API key. Please check your API key and try again.", response.status);
          } else {
            throw new AnthropicApiError(errorMessage, response.status);
          }
        }
        
        const data = await response.json();
        
        // Our API route returns { result: [...] }
        if (!data || data.result === undefined) {
          throw new Error("Invalid response format from API");
        }
        
        // Return the result as a JSON string
        return JSON.stringify(data.result);
      } catch (error) {
        console.error("Error analyzing prompt:", error);
        
        // Handle abort error (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError("Request timed out. Please try again.");
        }
        
        // Re-throw API errors
        if (error instanceof AnthropicApiError) {
          throw error;
        }
        
        // Handle network errors
        if (error instanceof Error && error.message.includes('fetch')) {
          throw new NetworkError("Network error. Please check your internet connection.");
        }
        
        // Handle other errors
        throw error;
      }
    }
  };
}