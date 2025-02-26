"use client"
import { useState, useCallback } from "react";
import { useApiKey } from "@/hooks/useApiKey";
import { getAnthropicClient } from "@/api/anthropicClient";
import { Analysis } from "@/components/Editor";
import { debounce } from "lodash";

export function usePromptAnalysis() {
  const { apiKey } = useApiKey();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Map API response categories to UI categories
  const mapCategoryToType = (category: string): 'assumption' | 'ambiguity' | 'technical' => {
    switch (category) {
      case 'CAPABILITY_ASSUMPTION':
        return 'assumption';
      case 'AMBIGUOUS_INSTRUCTION':
      case 'CONFLICTING_DIRECTIVES':
        return 'ambiguity';
      case 'UNDERSPECIFIED_PARAMETERS':
        return 'technical';
      default:
        return 'ambiguity';
    }
  };

  // Parse the JSON response and convert to Analysis[] format
  const parseAnalysisResponse = (content: string, jsonResponse: any): Analysis[] => {
    try {
      const issues = Array.isArray(jsonResponse) ? jsonResponse : [];
      
      return issues.map((issue, index) => {
        // Find the position of the issue text in the content
        const start = content.indexOf(issue.text);
        const end = start + issue.text.length;
        
        return {
          start: start >= 0 ? start : 0,
          end: end >= 0 ? end : 0,
          type: mapCategoryToType(issue.category),
          text: issue.text,
          suggestion: issue.suggestion,
          explanation: `This ${mapCategoryToType(issue.category)} issue might cause misalignment between your intent and the LLM's interpretation.`
        };
      });
    } catch (error) {
      console.error("Error parsing analysis response:", error);
      return [];
    }
  };

  // Create a debounced analysis function
  const debouncedAnalyze = useCallback(
    debounce(async (content: string) => {
      if (!apiKey || !content.trim()) {
        setAnalyses([]);
        return;
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const client = getAnthropicClient(apiKey);
        const response = await client.analyzePrompt(content);
        
        // Parse the JSON string response
        const jsonResponse = JSON.parse(response);
        const newAnalyses = parseAnalysisResponse(content, jsonResponse);
        
        setAnalyses(newAnalyses);
      } catch (error) {
        console.error("Analysis failed:", error);
        setError("Failed to analyze prompt. Please try again.");
        setAnalyses([]);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000), // 1 second debounce
    [apiKey]
  );

  const analyzePrompt = useCallback(
    (content: string) => {
      debouncedAnalyze(content);
    },
    [debouncedAnalyze]
  );

  return {
    analyzePrompt,
    analyses,
    isAnalyzing,
    error
  };
}