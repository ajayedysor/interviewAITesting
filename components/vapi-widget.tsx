"use client"

// PRESERVED VAPI CODE (Disabled)
/*
import type React from "react"

import { useVapi } from "@/hooks/use-vapi"
import { Mic, Phone, AlertCircle } from "lucide-react"
import { Button } from "./ui/button"

export function VapiWidget() {
  const { isCalling, volumeLevel, start, stop, isConfigured } = useVapi()

  const volumeStyle = {
    "--volume-level": `${Math.max(0.1, volumeLevel * 2)}`,
  } as React.CSSProperties

  return (
    <div className="fixed bottom-6 right-6">
      <div className="bg-black rounded-lg p-4 shadow-lg flex items-center space-x-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {isCalling && (
            <>
              <div
                className="absolute inset-0 bg-white/20 rounded-full animate-pulse-slow"
                style={{ transform: `scale(var(--volume-level))`, transition: "transform 0.1s ease-out" }}
              />
              <div
                className="absolute inset-0 bg-white/10 rounded-full animate-pulse-medium"
                style={{ transform: `scale(var(--volume-level))`, transition: "transform 0.1s ease-out" }}
              />
            </>
          )}
          <div className="relative w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            {!isConfigured ? <AlertCircle className="w-6 h-6 text-red-400" /> : <Mic className="w-6 h-6 text-white" />}
          </div>
        </div>
        <div className="flex flex-col items-start">
          <p className="text-white font-medium">Need support?</p>
          {!isConfigured ? (
            <p className="text-red-400 text-sm mt-1">Configuration missing</p>
          ) : isCalling ? (
            <Button onClick={stop} variant="destructive" className="mt-1">
              <Phone className="w-4 h-4 mr-2" />
              End Call
            </Button>
          ) : (
            <Button onClick={start} className="mt-1 bg-white text-black hover:bg-gray-200">
              Start voice chat
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
*/

export function VapiWidget() {
  return null;
}
