"use client"
import { ChevronDown, Settings } from "lucide-react"
import { useEffect, useState, useRef } from "react"

import { Button } from "@/components/ui/button"
import Editor, { Analysis, EditorRef } from "@/components/Editor"
import ApiKeyDialog from "@/components/ApiKeyDialog"
import { useApiKey } from "@/hooks/useApiKey"

export default function DashboardPage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const { apiKey, isLoading, saveApiKey, clearApiKey } = useApiKey() // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const editorRef = useRef<EditorRef>(null)

  if (isLoading) {
    return null // Or show a loading spinner
  }

  // Function to handle editor input attempts without API key
  const handleEditorInputAttempt = () => {
    if (!apiKey) {
      setShowApiKeyDialog(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Top Bar */}
      <div className="flex h-12 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-2">
            <span className="text-sm font-medium text-zinc-50">Clarion</span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">v0</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => setShowApiKeyDialog(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid flex-1 grid-cols-2 divide-x divide-zinc-800">
        <div className="flex flex-col divide-y divide-zinc-800">
          {/* Inline Prompt Editor Section */}
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <span className="text-xs font-medium text-zinc-400">PROMPT EDITOR</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <Editor 
              ref={editorRef}
              onAnalysisSelect={setSelectedAnalysis} 
              onInputAttempt={handleEditorInputAttempt}
            />
          </div>

          {/* Examples Section */}
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <span className="text-xs font-medium text-zinc-400">EXAMPLES</span>
                <span className="rounded bg-zinc-800 px-1.5 text-xs text-zinc-400">4</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div 
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => {
                  // Set editor content
                  if (editorRef.current) {
                    editorRef.current.setContent("Could this last sentence be improved: Engaged with the community through various channels and initiatives that resulted in positive outcomes for all stakeholders involved.");
                    editorRef.current.setPreloadedAnalysis([{
                      start: 28,
                      end: 36,
                      type: 'assumption',
                      text: "improved",
                      suggestion: "Specify what 'improved' means in this context. Are you looking for more concise wording, more specific details, or different phrasing?",
                      explanation: "This assumption issue occurs because 'improved' is subjective and depends on what aspects of writing you're trying to enhance (clarity, brevity, impact, etc.)."
                    }]);
                  }
                }}
              >
                <h3 className="mb-1 text-sm font-medium text-zinc-50">Knowledge Assumption</h3>
                <p className="text-sm text-zinc-400">User-specific knowledge that is genuinely outside of the model's training data.</p>
              </div>
              
              <div 
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => {
                  // Set editor content
                  if (editorRef.current) {
                    editorRef.current.setContent("Make the image better while keeping the same style.");
                    editorRef.current.setPreloadedAnalysis([{
                      start: 15,
                      end: 21,
                      type: 'ambiguity',
                      text: "better",
                      suggestion: "Specify what 'better' means by describing concrete improvements: 'Enhance the image contrast and sharpness while maintaining the current artistic style.'",
                      explanation: "This ambiguity issue arises because 'better' can be interpreted in many ways (resolution, color balance, composition, etc.)."
                    }]);
                  }
                }}
              >
                <h3 className="mb-1 text-sm font-medium text-zinc-50">Ambiguous Instruction</h3>
                <p className="text-sm text-zinc-400">Instruction that can be interpreted in multiple valid ways, forcing the model to guess.</p>
              </div>
              
              <div 
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => {
                  // Set editor content
                  if (editorRef.current) {
                    editorRef.current.setContent("Make the image more vibrant but also keep it muted and subtle.");
                    editorRef.current.setPreloadedAnalysis([{
                      start: 9,
                      end: 27,
                      type: 'technical',
                      text: "image more vibrant",
                      suggestion: "Resolve the contradiction by specifying which parts should be vibrant and which should be muted: 'Make the foreground elements more vibrant while keeping the background muted and subtle.'",
                      explanation: "This contains conflicting instructions because 'vibrant' and 'muted' are opposing visual qualities. The model cannot simultaneously make the entire image both vibrant and muted.",
                      additionalHighlights: [
                        {
                          start: 37,
                          end: 61,
                          text: "keep it muted and subtle"
                        }
                      ]
                    }]);
                  }
                }}
              >
                <h3 className="mb-1 text-sm font-medium text-zinc-50">Conflicting Instructions</h3>
                <p className="text-sm text-zinc-400">Contradictory directions that cannot be simultaneously satisfied by the LLM.</p>
              </div>
              
              <div 
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 cursor-pointer hover:bg-zinc-800 transition-colors"
                onClick={() => {
                  // Set editor content
                  if (editorRef.current) {
                    editorRef.current.setContent("Write me something about climate change.");
                    editorRef.current.setPreloadedAnalysis([{
                      start: 0,
                      end: 39,
                      type: 'drift',
                      text: "Write me something about climate change.",
                      suggestion: "Provide a specific task and scope: 'Write a 2-paragraph explanation of how rising sea levels affect coastal communities.'",
                      explanation: "This drift issue occurs because the broad, open-ended request could lead the model to generate content that extends beyond what you actually need or want."
                    }]);
                  }
                }}
              >
                <h3 className="mb-1 text-sm font-medium text-zinc-50">Response Drift</h3>
                <p className="text-sm text-zinc-400">Unclear, unconstrained or in some cases over-explained requests that cause the model to drift outside of your intended scope.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Response Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 p-4">
            <span className="text-xs font-medium text-zinc-400">ANALYSIS</span>
          </div>
          <div className="flex-1 p-4">
            <div className="space-y-4">
              {selectedAnalysis ? (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <div className="mb-4 flex items-center gap-x-2">
                    <span className={`h-2 w-2 rounded-full ${
                      selectedAnalysis.type === 'assumption' ? 'bg-blue-500' :
                      selectedAnalysis.type === 'ambiguity' ? 'bg-yellow-500' :
                      selectedAnalysis.type === 'technical' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`} />
                    <span className="text-sm font-medium text-zinc-200">
                      {selectedAnalysis.type.charAt(0).toUpperCase() + selectedAnalysis.type.slice(1)} Detected
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-1 text-xs font-medium text-zinc-400">HIGHLIGHTED TEXT</h4>
                      <p className="text-sm text-zinc-200">&ldquo;{selectedAnalysis.text}&rdquo;</p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-xs font-medium text-zinc-400">SUGGESTION</h4>
                      <p className="text-sm text-zinc-200">{selectedAnalysis.suggestion}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-xs font-medium text-zinc-400">EXPLANATION</h4>
                      <p className="text-sm text-zinc-200">{selectedAnalysis.explanation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <h3 className="mb-2 text-sm font-medium text-zinc-200">Click on underlined text to see suggestions</h3>
                  <p className="text-sm text-zinc-400">
                    Blue underlines indicate assumptions that might need clarification
                    <br />
                    Yellow underlines indicate instructions that could be interpreted in multiple ways
                    <br />
                    Red underlines are instructions that contradict each other
                    <br />
                    Purple underlines indicate sections that could lead the model to drift/extend beyond the primary task
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Key Dialog - Now closable */}
      {showApiKeyDialog && (
        <ApiKeyDialog 
          onSubmit={(newKey) => {
            saveApiKey(newKey);
            setShowApiKeyDialog(false);
          }}
          onClose={() => setShowApiKeyDialog(false)}
        />
      )}
    </div>
  )
}

