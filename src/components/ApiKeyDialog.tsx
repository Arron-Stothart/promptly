"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ApiKeyDialogProps {
  onSubmit: (apiKey: string) => void
}

export default function ApiKeyDialog({ onSubmit }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      onSubmit(apiKey.trim())
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent 
        className="border border-zinc-800 bg-zinc-900 p-6 shadow-lg"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        closeButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-medium text-zinc-200">Enter Anthropic API Key</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="sk-ant-xxx..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-zinc-800 border-zinc-700"
            />
            <p className="mt-2 text-xs text-zinc-400">
              Your API key will be stored securely in your browser&apos;s local storage
            </p>
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!apiKey.trim()}
          >
            Save API Key
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 