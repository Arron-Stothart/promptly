"use client"
import { useState, useRef } from "react"

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
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Mock analysis logic - replace with actual AI analysis later
  const analyzeText = (text: string) => {
    const newAnalyses: Analysis[] = []
    
    // Example analysis patterns
    if (text.includes("better")) {
      newAnalyses.push({
        start: text.indexOf("better"),
        end: text.indexOf("better") + 6,
        type: 'ambiguity',
        text: "better",
        suggestion: "Consider specifying what 'better' means in this context",
        explanation: "The term 'better' is subjective and may be interpreted differently by the AI."
      })
    }

    if (text.includes("quickly")) {
      newAnalyses.push({
        start: text.indexOf("quickly"),
        end: text.indexOf("quickly") + 7,
        type: 'assumption',
        text: "quickly",
        suggestion: "Define a specific time frame or metric",
        explanation: "'Quickly' is relative and may not translate to the desired performance."
      })
    }

    setAnalyses(newAnalyses)
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    analyzeText(newContent)
  }

  const handleAnalysisClick = (analysis: Analysis) => {
    setSelectedAnalysis(analysis)
    onAnalysisSelect?.(analysis)
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
          onClick={() => handleAnalysisClick(analysis)}
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
    <div className="relative rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <textarea
        ref={inputRef}
        value={content}
        onChange={handleInput}
        placeholder="Start typing..."
        className="w-full resize-none bg-transparent font-mono text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
        rows={3}
      />
      <div className="pointer-events-none absolute left-0 top-0 p-3">
        <div className="pointer-events-auto font-mono text-sm text-zinc-200">
          {getHighlightedContent()}
        </div>
      </div>
    </div>
  )
}
