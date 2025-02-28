"use client"
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
      {/* <div className="flex flex-col items-center justify-center px-4 py-16 text-center md:py-24">
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
      </div> */}

      {/* Long Text Explanation Section */}
      <div className="mx-auto max-w-3xl p-6 my-12">
        <div className="prose prose-invert max-w-none">
            <h3>
              Some issues I&apos;ve encountered with Claude 3.7 Sonnet as of 28/02/2025:
            </h3>
            <ul className="list-disc pl-6 py-2">
              <li>Overcomplicates Tasks, particularly in Cursor Agent, triggering unnecessary file searches and exploration</li>
            <li>Performs worse than Claude 3.5 at following instructions</li>
            <li>Is proactive to a fault, often ignores prompt constraints in favor of perceived helpfulness</li>
          </ul>
        </div>
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

