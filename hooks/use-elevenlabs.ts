"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback, useState } from "react";

export interface Message {
  role: "user" | "ai";
  message: string;
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting";

interface UseElevenLabsOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: Message) => void;
  onError?: (error: string) => void;
}

export function useElevenLabs(options: UseElevenLabsOptions = {}) {
  const { onConnect, onDisconnect, onMessage, onError } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);

  const addMessage = useCallback((role: "user" | "ai", message: string) => {
    setMessages((prev) => [...prev, { role, message }]);
    onMessage?.({ role, message });
  }, [onMessage]);

  const conversation = useConversation({
    onConnect: () => {
      setConnectionStatus("connected");
      setInterviewStartTime(new Date());
      setIsLoading(false);
      onConnect?.();
    },
    onDisconnect: () => {
      setConnectionStatus("disconnected");
      setIsLoading(false);
      onDisconnect?.();
    },
    onMessage: (message) => {
      addMessage(message.source === "user" ? "user" : "ai", message.message);
    },
    onError: (err) => {
      const errorMsg = typeof err === 'string' ? err : "An error occurred with ElevenLabs";
      setError(errorMsg);
      setIsLoading(false);
      onError?.(errorMsg);
    },
  });

  const startInterview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setConnectionStatus("connecting");

      // Get signed URL from our API
      const response = await fetch("/api/elevenlabs/get-signed-url");
      if (!response.ok) {
        throw new Error("Failed to get signed URL");
      }

      const { signed_url } = await response.json();

      await conversation.startSession({
        signedUrl: signed_url,
      });

    } catch (err: any) {
      const errorMsg = err.message || "Failed to start interview";
      setError(errorMsg);
      setConnectionStatus("disconnected");
      setIsLoading(false);
      onError?.(errorMsg);
    }
  }, [conversation, onError]);

  const stopInterview = useCallback(async () => {
    try {
      await conversation.endSession();
      setConnectionStatus("disconnected");
    } catch (err: any) {
      console.error("Error stopping interview:", err);
    }
  }, [conversation]);



  return {
    messages,
    connectionStatus,
    isLoading,
    error,
    interviewStartTime,
    isSpeaking: conversation.isSpeaking,
    status: conversation.status,
    startInterview,
    stopInterview,
    sendRuntimeMessage: conversation.sendUserMessage,
  };
}
