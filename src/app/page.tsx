"use client"
import { ArrowRight } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import ApiKeyDialog from "@/components/ApiKeyDialog"
import { useApiKey } from "@/hooks/useApiKey"

export default function InfoPage() {
  const { apiKey, isLoading, saveApiKey } = useApiKey()
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)

  if (isLoading) {
    return null // Or show a loading spinner
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Top Bar */}
      <div className="flex h-12 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-2">
            <span className="text-sm font-medium text-zinc-50">Resonnet</span>
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">v3.7</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowApiKeyDialog(true)}
          >
            {apiKey ? "API Key Set" : "Set API Key"}
          </Button>
          <Link href="/app">
            <Button variant="outline" size="sm">
              Go to App
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center md:py-24">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-50 md:text-5xl">
          Craft Better AI Prompts with <span className="text-blue-500">Resonnet</span>
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-zinc-400">
          An intelligent prompt analysis tool that helps you identify and fix common issues in your AI prompts for better results.
        </p>
        <Link href="/app">
          <Button size="lg" className="gap-2">
            Try Resonnet Now <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Features Section */}
      <div className="grid gap-8 px-4 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
          <h3 className="mb-2 text-xl font-medium text-zinc-50">Knowledge Assumptions</h3>
          <p className="text-zinc-400">
            Identify when your prompts assume knowledge that the AI model might not have access to.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
          </div>
          <h3 className="mb-2 text-xl font-medium text-zinc-50">Ambiguous Instructions</h3>
          <p className="text-zinc-400">
            Detect vague or unclear instructions that could be interpreted in multiple ways.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
            <div className="h-2 w-2 rounded-full bg-red-500" />
          </div>
          <h3 className="mb-2 text-xl font-medium text-zinc-50">Conflicting Instructions</h3>
          <p className="text-zinc-400">
            Spot contradictory directions that cannot be simultaneously satisfied by the AI.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
          </div>
          <h3 className="mb-2 text-xl font-medium text-zinc-50">Response Drift</h3>
          <p className="text-zinc-400">
            Identify prompts that could cause the AI to generate content beyond your intended scope.
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="border-t border-zinc-800 px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-zinc-50">How It Works</h2>
          <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-50">
                1
              </div>
              <div>
                <h3 className="mb-2 text-xl font-medium text-zinc-50">Enter Your Prompt</h3>
                <p className="text-zinc-400">
                  Type or paste your AI prompt into the editor. Resonnet works with prompts for any AI model.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-50">
                2
              </div>
              <div>
                <h3 className="mb-2 text-xl font-medium text-zinc-50">Review Analysis</h3>
                <p className="text-zinc-400">
                  Resonnet automatically highlights potential issues in your prompt with color-coded underlines.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-50">
                3
              </div>
              <div>
                <h3 className="mb-2 text-xl font-medium text-zinc-50">Improve Your Prompt</h3>
                <p className="text-zinc-400">
                  Apply the suggested improvements to create clearer, more effective prompts that get better results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-zinc-800 px-4 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-zinc-50">Ready to improve your AI prompts?</h2>
        <p className="mb-8 text-zinc-400">
          Start crafting clearer, more effective prompts today.
        </p>
        <Link href="/app">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-zinc-800 px-4 py-6 text-center text-sm text-zinc-500">
        <p>© {new Date().getFullYear()} Resonnet. All rights reserved.</p>
      </div>

      {/* API Key Dialog */}
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

