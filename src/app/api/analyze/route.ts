import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { content, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 15) {
      return NextResponse.json(
        { result: [] },
        { status: 200 }
      );
    }

    // Initialize the Anthropic client with the API key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Make the request using the SDK
    const response = await anthropic.messages.create({
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
    });

    // Extract the response text
    const responseContent = response.content[0];
    const responseText = 'type' in responseContent && responseContent.type === 'text' 
      ? responseContent.text 
      : '';
    
    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      // If it's not an array, wrap it in an array
      const result = Array.isArray(jsonResponse) ? jsonResponse : [];
      return NextResponse.json({ result });
    } catch (parseError) {
      console.error("Error parsing API response as JSON:", parseError);
      // Return empty array if parsing fails
      return NextResponse.json({ result: [] });
    }
  } catch (error) {
    console.error("Error in analyze route:", error);
    
    // Handle specific Anthropic API errors
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    } else if (error instanceof Error && error.message.includes('429')) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 