/*
"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface VapiConfig {
  publicKey: string
  assistantId: string
}

interface VariableValues {
  name: string 
  course: string
  university: string
  userSummary: string
  passportNumber: string
  questions: string
}

export const useVapi = (variableValues?: VariableValues, callbacks?: {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onError?: (error: any) => void;
}, meetingId?: string, audioStream?: MediaStream | null) => {
  const [isCalling, setIsCalling] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [isConfigured, setIsConfigured] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)
  const vapiRef = useRef<any>(null)
  const configRef = useRef<VapiConfig | null>(null)

  useEffect(() => {
    const initializeVapi = async () => {
      try {
        const response = await fetch("/api/vapi/config")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const config = await response.json()

        if (!config.publicKey || !config.assistantId) {
          throw new Error("Missing VAPI configuration")
        }

        configRef.current = config
        setIsConfigured(true)
        setConfigError(null)

        const { default: Vapi } = await import("@vapi-ai/web")
        vapiRef.current = new Vapi(config.publicKey)

        vapiRef.current.on("call-start", (event: any) => {
          setIsCalling(true)
          callbacks?.onCallStart?.()
        })

        vapiRef.current.on("call-end", () => {
          setIsCalling(false)
          setVolumeLevel(0)
          callbacks?.onCallEnd?.()
        })

        vapiRef.current.on("volume-level", (level: number) => {
          setVolumeLevel(level)
        })

        vapiRef.current.on("error", (error: any) => {
          setIsCalling(false)
          setVolumeLevel(0)
          callbacks?.onError?.(error)
        })
      } catch (error) {
        console.error("Failed to initialize VAPI:", error)
        setConfigError("Something went wrong - Please check your internet connection")
        setIsConfigured(false)
      }
    }

    initializeVapi()

    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop()
        } catch (error) {
          console.warn("Error stopping VAPI:", error)
        }
      }
    }
  }, [])

  const start = useCallback(async () => {
    if (!vapiRef.current || !configRef.current) {
      console.error("VAPI not initialized")
      return
    }

    try {
      const assistantOverrides: any = {}
      if (variableValues) {
        assistantOverrides.variableValues = variableValues
      }
      await vapiRef.current.start(configRef.current.assistantId, assistantOverrides)
    } catch (error) {
      console.error("Failed to start call:", error)
    }
  }, [variableValues, meetingId, audioStream])

  const stop = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.stop()
    }
  }, [])

  return {
    isCalling,
    volumeLevel,
    isConfigured,
    configError,
    vapiRef,
    start,
    stop,
  }
}
*/
