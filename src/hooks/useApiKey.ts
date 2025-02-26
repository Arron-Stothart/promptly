"use client"
import { useState, useEffect } from "react"

const API_KEY_STORAGE_KEY = "anthropic-api-key"

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load API key from localStorage on mount
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY)
    setApiKey(storedApiKey)
    setIsLoading(false)
  }, [])

  const saveApiKey = (newApiKey: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, newApiKey)
    setApiKey(newApiKey)
  }

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY)
    setApiKey(null)
  }

  return {
    apiKey,
    isLoading,
    saveApiKey,
    clearApiKey,
  }
} 