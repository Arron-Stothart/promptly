"use client"

import { useState, useCallback, useRef, useEffect } from "react";
import { useApiKey } from "@/hooks/useApiKey";
import { getAnthropicClient } from "@/api/anthropicClient";
import { Analysis } from "@/components/Editor";
import { debounce } from "lodash";

// Cache interface for storing previous analysis results
interface AnalysisCache {
  [contentHash: string]: Analysis[];
}

export function usePromptAnalysis() {
  const { apiKey } = useApiKey();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for advanced debouncing and request management
  const lastAnalyzedContent = useRef<string>("");
  const analysisQueue = useRef<string | null>(null);
  const isRequestInProgress = useRef(false);
  const typingPatternRef = useRef<number[]>([]);
  const debounceTimeRef = useRef(800); // Start with 800ms default
  const analysisCache = useRef<AnalysisCache>({});
  const MAX_CACHE_ITEMS = 20;
  const MIN_CONTENT_LENGTH = 15;

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

  // Simple hash function for caching
  const hashContent = (content: string): string => {
    // For longer content, use a more sophisticated hash
    if (content.length > 100) {
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        hash = ((hash << 5) - hash) + content.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return hash.toString(16);
    }
    // For shorter content, just use the content itself
    return content;
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

  // Adaptive debounce timing calculation
  useEffect(() => {
    const calculateAdaptiveDebounce = () => {
      if (typingPatternRef.current.length < 5) return;
      
      // Calculate average time between keystrokes
      const intervals = [];
      for (let i = 1; i < typingPatternRef.current.length; i++) {
        intervals.push(typingPatternRef.current[i] - typingPatternRef.current[i-1]);
      }
      
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      
      // Adjust debounce time based on typing speed
      // Fast typists (< 200ms between keystrokes) get longer debounce
      // Slow typists get shorter debounce for more responsive feedback
      if (avgInterval < 200) {
        debounceTimeRef.current = Math.min(1200, debounceTimeRef.current + 50);
      } else {
        debounceTimeRef.current = Math.max(500, debounceTimeRef.current - 50);
      }
      
      // Reset typing pattern after adjustment
      typingPatternRef.current = typingPatternRef.current.slice(-5);
    };
    
    const intervalId = setInterval(calculateAdaptiveDebounce, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Actual analysis function that handles API calls
  const performAnalysis = useCallback(async (content: string) => {
    // Skip if already analyzed this exact content
    if (content === lastAnalyzedContent.current) return;
    
    // Skip analysis for very short content
    if (content.trim().length < MIN_CONTENT_LENGTH) {
      setAnalyses([]);
      return;
    }
    
    // Check cache first
    const contentHash = hashContent(content);
    if (analysisCache.current[contentHash]) {
      setAnalyses(analysisCache.current[contentHash]);
      return;
    }
    
    if (!apiKey) {
      setAnalyses([]);
      return;
    }

    // Mark that we're starting analysis
    isRequestInProgress.current = true;
    setIsAnalyzing(true);
    setError(null);

    try {
      const client = getAnthropicClient(apiKey);
      const response = await client.analyzePrompt(content);
      
      // Store this as the last analyzed content
      lastAnalyzedContent.current = content;
      
      // Parse the JSON string response
      const jsonResponse = JSON.parse(response);
      const newAnalyses = parseAnalysisResponse(content, jsonResponse);
      
      // Update cache (with size limit)
      if (Object.keys(analysisCache.current).length >= MAX_CACHE_ITEMS) {
        // Remove oldest cache entry
        const oldestKey = Object.keys(analysisCache.current)[0];
        const newCache = { ...analysisCache.current };
        delete newCache[oldestKey];
        analysisCache.current = newCache;
      }
      analysisCache.current[contentHash] = newAnalyses;
      
      setAnalyses(newAnalyses);
    } catch (error) {
      console.error("Analysis failed:", error);
      setError("Failed to analyze prompt. Please try again.");
      setAnalyses([]);
    } finally {
      setIsAnalyzing(false);
      isRequestInProgress.current = false;
      
      // Check if there's a queued request
      if (analysisQueue.current) {
        const queuedContent = analysisQueue.current;
        analysisQueue.current = null;
        performAnalysis(queuedContent);
      }
    }
  }, [apiKey]);

  // Create a debounced analysis function that adapts to the current debounce time
  const debouncedAnalyze = useCallback(
    (content: string) => {
      // Record timestamp for typing pattern analysis
      typingPatternRef.current.push(Date.now());
      if (typingPatternRef.current.length > 20) {
        typingPatternRef.current = typingPatternRef.current.slice(-20);
      }
      
      // Clear any existing timeout
      if (debouncedAnalyze.timeoutId) {
        clearTimeout(debouncedAnalyze.timeoutId);
      }
      
      // Set new timeout with current debounce time
      debouncedAnalyze.timeoutId = setTimeout(() => {
        if (isRequestInProgress.current) {
          // Queue this request for when the current one finishes
          analysisQueue.current = content;
        } else {
          performAnalysis(content);
        }
      }, debounceTimeRef.current);
    },
    [performAnalysis]
  ) as any; // Type assertion to allow adding timeoutId property

  const analyzePrompt = useCallback(
    (content: string) => {
      // Skip analysis for very short content
      if (content.trim().length < MIN_CONTENT_LENGTH) {
        setAnalyses([]);
        return;
      }
      
      // Check if content is identical to last analyzed
      if (content === lastAnalyzedContent.current) {
        return;
      }
      
      // Check cache first for immediate response
      const contentHash = hashContent(content);
      if (analysisCache.current[contentHash]) {
        setAnalyses(analysisCache.current[contentHash]);
        return;
      }
      
      // Otherwise, queue for debounced analysis
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