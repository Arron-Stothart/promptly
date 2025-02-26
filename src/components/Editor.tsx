"use client"
import { useState, useRef, useEffect } from "react"

export interface Analysis {
  start: number
  end: number
  type: 'assumption' | 'ambiguity' | 'technical'
  text: string
  suggestion: string
  explanation: string
}

interface EditorProps {
  onAnalysisSelect?: (analysis: Analysis | null) => void
}

export default function Editor({ onAnalysisSelect }: EditorProps) {
  const [content, setContent] = useState("")
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)

  // Mock analysis logic - replace with actual AI analysis later
  const analyzeText = (text: string) => {
    const newAnalyses: Analysis[] = []
    
    let betterIndex = text.indexOf("better")
    while (betterIndex !== -1) {
      newAnalyses.push({
        start: betterIndex,
        end: betterIndex + 6,
        type: 'ambiguity',
        text: "better",
        suggestion: "Consider specifying what 'better' means in this context",
        explanation: "The term 'better' is subjective and may be interpreted differently by the AI."
      })
      betterIndex = text.indexOf("better", betterIndex + 1)
    }

    let quicklyIndex = text.indexOf("quickly")
    while (quicklyIndex !== -1) {
      newAnalyses.push({
        start: quicklyIndex,
        end: quicklyIndex + 7,
        type: 'assumption',
        text: "quickly",
        suggestion: "Define a specific time frame or metric",
        explanation: "'Quickly' is relative and may not translate to the desired performance."
      })
      quicklyIndex = text.indexOf("quickly", quicklyIndex + 1)
    }

    setAnalyses(newAnalyses)
  }

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

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    analyzeText(newContent)
    
    // Update cursor position
    setCursorPosition(e.target.selectionStart)
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
    let result = []
    let lastIndex = 0

    // Sort analyses by start position
    const sortedAnalyses = [...analyses].sort((a, b) => a.start - b.start)

    for (const analysis of sortedAnalyses) {
      // Add text before the highlight
      if (analysis.start > lastIndex) {
        result.push(
          <span key={`text-${lastIndex}`}>
            {content.slice(lastIndex, analysis.start)}
          </span>
        )
      }

      // Add highlighted text
      result.push(
        <span
          key={`highlight-${analysis.start}`}
          className={`cursor-pointer border-b-2 ${
            analysis.type === 'assumption' ? 'border-blue-500' :
            analysis.type === 'ambiguity' ? 'border-yellow-500' :
            'border-purple-500'
          }`}
          onClick={(e) => handleAnalysisClick(analysis, e)}
          style={{ pointerEvents: 'auto' }}
        >
          {content.slice(analysis.start, analysis.end)}
        </span>
      )

      lastIndex = analysis.end
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
        className="w-full h-full resize-none bg-transparent font-mono text-sm text-transparent caret-zinc-200 p-3 whitespace-pre-wrap focus:outline-none"
        rows={5}
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
    </div>
  )
}
