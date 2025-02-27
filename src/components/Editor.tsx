"use client"
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { usePromptAnalysis } from "@/hooks/usePromptAnalysis"

export interface Analysis {
  start: number
  end: number
  type: 'assumption' | 'ambiguity' | 'technical' | 'drift'
  text: string
  suggestion: string
  explanation: string
  additionalHighlights?: { start: number; end: number; text: string }[]
}

export interface EditorRef {
  setContent: (content: string) => void
  setPreloadedAnalysis: (analyses: Analysis[]) => void
}

interface EditorProps {
  onAnalysisSelect?: (analysis: Analysis | null) => void
  onInputAttempt?: () => void
}

const Editor = forwardRef<EditorRef, EditorProps>(({ onAnalysisSelect, onInputAttempt }, ref) => {
  const [content, setContent] = useState("")
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [cursorPosition, setCursorPosition] = useState<number | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars
  const [visualFeedbackState, setVisualFeedbackState] = useState<'idle' | 'typing' | 'analyzing' | 'analyzed'>('idle')
  const visualFeedbackTimer = useRef<NodeJS.Timeout | null>(null)
  
  // Replace mock analysis with real analysis
  const { analyzePrompt, analyses: apiAnalyses, isAnalyzing, error } = usePromptAnalysis();
  
  // Add state for preloaded analyses
  const [preloadedAnalyses, setPreloadedAnalyses] = useState<Analysis[]>([]);
  
  // Combine API analyses with preloaded analyses
  const analyses = preloadedAnalyses.length > 0 ? preloadedAnalyses : apiAnalyses;

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    setContent: (newContent: string) => {
      setContent(newContent);
      // Clear preloaded analyses when setting content manually
      setPreloadedAnalyses([]);
      // Reset visual feedback state
      setVisualFeedbackState('idle');
      // Focus the textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    },
    setPreloadedAnalysis: (newAnalyses: Analysis[]) => {
      setPreloadedAnalyses(newAnalyses);
      setVisualFeedbackState('analyzed');
      
      // Auto-select the first analysis if available
      if (newAnalyses.length > 0) {
        const firstAnalysis = newAnalyses[0];
        setSelectedAnalysis(firstAnalysis);
        onAnalysisSelect?.(firstAnalysis);
        
        // Set cursor position to the start of the highlighted text
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(firstAnalysis.start, firstAnalysis.end);
          }
        }, 0);
      }
    }
  }));

  // Update the handleInput function to use the real analysis
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Notify parent component about input attempt
    onInputAttempt?.()
    
    const newContent = e.target.value
    setContent(newContent)
    
    // Clear any preloaded analyses when user types
    setPreloadedAnalyses([]);
    
    // Provide immediate visual feedback
    setVisualFeedbackState('typing')
    
    // Clear any existing timer
    if (visualFeedbackTimer.current) {
      clearTimeout(visualFeedbackTimer.current)
    }
    
    // Set a timer to show "analyzing" state after a short delay
    // This prevents flickering for very quick analyses or cached results
    visualFeedbackTimer.current = setTimeout(() => {
      if (newContent.trim().length >= 15) {
        setVisualFeedbackState('analyzing')
      }
    }, 300)
    
    // Trigger the actual analysis
    analyzePrompt(newContent)
    
    // Update cursor position
    setCursorPosition(e.target.selectionStart)
  }

  // Update visual feedback state based on analysis status
  useEffect(() => {
    if (isAnalyzing) {
      setVisualFeedbackState('analyzing')
    } else if (analyses.length > 0) {
      setVisualFeedbackState('analyzed')
    } else if (content.trim().length < 15) {
      setVisualFeedbackState('idle')
    }
    
    // Clear any pending visual feedback timer
    if (visualFeedbackTimer.current) {
      clearTimeout(visualFeedbackTimer.current)
      visualFeedbackTimer.current = null
    }
  }, [isAnalyzing, analyses, content])

  // Synchronize scrolling between textarea and overlay
  useEffect(() => {
    const textarea = textareaRef.current
    const overlay = overlayRef.current
    
    if (!textarea || !overlay) return
    
    const syncScroll = () => {
      overlay.scrollTop = textarea.scrollTop
      overlay.scrollLeft = textarea.scrollLeft
    }
    
    textarea.addEventListener('scroll', syncScroll)
    return () => textarea.removeEventListener('scroll', syncScroll)
  }, [])

  // Update cursor position and selection
  const handleSelectionChange = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    setCursorPosition(textarea.selectionStart)
  }

  const handleAnalysisClick = (analysis: Analysis, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setSelectedAnalysis(analysis)
    onAnalysisSelect?.(analysis)
    
    // Set cursor position to the start of the highlighted text
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(analysis.start, analysis.end)
    }
  }

  const getHighlightedContent = () => {
    const result = []
    let lastIndex = 0

    // Create a flat list of all highlights (primary + additional)
    const allHighlights: { start: number; end: number; text: string; type: string; analysisIndex: number }[] = []
    
    analyses.forEach((analysis, index) => {
      // Add the primary highlight
      allHighlights.push({
        start: analysis.start,
        end: analysis.end,
        text: analysis.text,
        type: analysis.type,
        analysisIndex: index
      })
      
      // Add any additional highlights
      if (analysis.additionalHighlights) {
        analysis.additionalHighlights.forEach(highlight => {
          allHighlights.push({
            start: highlight.start,
            end: highlight.end,
            text: highlight.text,
            type: analysis.type, // Use the same type as the parent analysis
            analysisIndex: index // Reference to the parent analysis
          })
        })
      }
    })

    // Sort all highlights by start position
    allHighlights.sort((a, b) => a.start - b.start)

    for (const highlight of allHighlights) {
      // Add text before the highlight
      if (highlight.start > lastIndex) {
        result.push(
          <span key={`text-${lastIndex}`}>
            {content.slice(lastIndex, highlight.start)}
          </span>
        )
      }

      // Check if this highlight belongs to the selected analysis
      const isSelected = selectedAnalysis && 
        (analyses[highlight.analysisIndex] === selectedAnalysis);

      // Add highlighted text with appropriate styling
      result.push(
        <span
          key={`highlight-${highlight.start}-${highlight.end}`}
          className={`cursor-pointer border-b-2 ${
            highlight.type === 'assumption' ? 'border-blue-500' :
            highlight.type === 'ambiguity' ? 'border-yellow-500' :
            highlight.type === 'technical' ? 'border-red-500' :
            'border-purple-500'
          } ${
            isSelected ? `${
              highlight.type === 'assumption' ? 'bg-blue-500/20' :
              highlight.type === 'ambiguity' ? 'bg-yellow-500/20' :
              highlight.type === 'technical' ? 'bg-red-500/20' :
              'bg-purple-500/20'
            }` : ''
          }`}
          onClick={(e) => handleAnalysisClick(analyses[highlight.analysisIndex], e)}
          style={{ pointerEvents: 'auto' }}
        >
          {content.slice(highlight.start, highlight.end)}
        </span>
      )

      lastIndex = highlight.end
    }

    // Add remaining text
    if (lastIndex < content.length) {
      result.push(
        <span key={`text-${lastIndex}`}>
          {content.slice(lastIndex)}
        </span>
      )
    }

    return result
  }

  // Get visual feedback indicator based on current state
  const getVisualFeedbackIndicator = () => {
    switch (visualFeedbackState) {
      case 'idle':
        return null;
      case 'typing':
        return (
          <div className="absolute bottom-2 right-2 text-xs text-zinc-400">
            Type more to analyze...
          </div>
        );
      case 'analyzing':
        return (
          <div className="absolute bottom-2 right-2 text-xs text-zinc-400 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing prompt...
          </div>
        );
      case 'analyzed':
        return (
          <div className="absolute bottom-2 right-2 text-xs text-green-400">
            Analysis complete
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative rounded-lg border border-zinc-800 bg-zinc-900">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleInput}
        onSelect={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onMouseUp={handleSelectionChange}
        onFocus={handleSelectionChange}
        placeholder="Start typing..."
        className="w-full h-full resize-none bg-transparent font-mono text-sm text-transparent caret-zinc-200 p-3 whitespace-pre-wrap focus:outline-none selection:bg-transparent selection:text-transparent"
        rows={10}
        style={{ 
          position: 'relative', 
          zIndex: 1,
        }}
      />
      <div 
        ref={overlayRef}
        aria-hidden="true"
        className="absolute top-0 left-0 p-3 w-full h-full overflow-hidden"
        style={{ 
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          color: 'rgb(228, 228, 231)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {getHighlightedContent()}
      </div>
      
      {/* Visual feedback indicator */}
      {getVisualFeedbackIndicator()}
      
      {/* Error message if analysis fails */}
      {error && (
        <div className="absolute bottom-2 left-2 text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  )
});

Editor.displayName = "Editor";

export default Editor;
