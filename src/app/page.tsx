"use client"
import { ChevronDown, Settings } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import Editor, { Analysis } from "@/components/Editor"
import ApiKeyDialog from "@/components/ApiKeyDialog"
import { useApiKey } from "@/hooks/useApiKey"

export default function DashboardPage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const { apiKey, isLoading, saveApiKey, clearApiKey } = useApiKey()
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)

  // Use useEffect to handle the API key check
  useEffect(() => {
    if (!apiKey && !isLoading) {
      setShowApiKeyDialog(true)
    }
  }, [apiKey, isLoading])

  if (isLoading) {
    return null // Or show a loading spinner
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
            <Editor onAnalysisSelect={setSelectedAnalysis} />
          </div>

          {/* Examples Section */}
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <span className="text-xs font-medium text-zinc-400">EXAMPLES</span>
                <span className="rounded bg-zinc-800 px-1.5 text-xs text-zinc-400">3</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {["Cnidaria", "Echinodermata", "Platyhelminthes"].map((item) => (
                <div key={item} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
                  <h3 className="mb-1 text-sm font-medium text-zinc-50">{item}</h3>
                  <p className="text-sm text-zinc-400">Example description for {item}...</p>
                </div>
              ))}
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
                    Yellow underlines indicate ambiguous terms
                    <br />
                    Purple underlines indicate technical terms that might need explanation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Key Dialog */}
      {showApiKeyDialog && (
        <ApiKeyDialog 
          onSubmit={(newKey) => {
            saveApiKey(newKey);
            setShowApiKeyDialog(false);
          }} 
        />
      )}
    </div>
  )
}

