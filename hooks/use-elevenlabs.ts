"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useRef, useEffect } from "react";

// Prefer local Next.js API routes; allow override via NEXT_PUBLIC_BACKEND_URL if needed
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "agent_9401kc3bnj8sfkys4vmqdrghmxdm";

export interface Message {
  id: string;
  role: "user" | "ai" | "system";
  text: string;
  timestamp: Date;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

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

  // Track connection status in ref for use in callbacks
  const connectionStatusRef = useRef<ConnectionStatus>("disconnected");

  // Update ref when state changes
  useEffect(() => {
    connectionStatusRef.current = connectionStatus;
  }, [connectionStatus]);

  const addMessage = useCallback(
    (role: "user" | "ai" | "system", text: string) => {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        role,
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      onMessage?.(newMessage);
    },
    [onMessage]
  );

  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ ElevenLabs WebSocket connected");
      setConnectionStatus("connected");
      connectionStatusRef.current = "connected";
      setInterviewStartTime(new Date());
      addMessage("system", "🟢 Connected to Interview Bot - Speak when ready!");
      onConnect?.();
    },
    onDisconnect: () => {
      console.log("🔴 ElevenLabs WebSocket disconnected");
      setConnectionStatus("disconnected");
      connectionStatusRef.current = "disconnected";
      addMessage("system", "🔴 Disconnected from Interview Bot");
      onDisconnect?.();
    },
    onMessage: (message) => {
      console.log("📨 Message received:", message.source, message.message);
      if (message.source === "user") {
        addMessage("user", message.message);
      } else if (message.source === "ai") {
        addMessage("ai", message.message);
      }
    },
    onError: (err) => {
      console.error("❌ Conversation error:", err);
      setConnectionStatus("error");
      connectionStatusRef.current = "error";
      setError(`Conversation error: ${err}`);
      onError?.(`${err}`);
    },
  });

  // Start interview session - using ElevenLabs WebSocket flow
  const startInterview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus("connecting");
    connectionStatusRef.current = "connecting";

    try {
      addMessage("system", "🔄 Connecting to interviewer...");

      // Get signed URL (Next.js API route uses your existing agent)
      const response = await fetch(`${API_BASE}/api/get-signed-url`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect");
      }

      console.log("🔗 Got signed URL, starting session...");

      // Start conversation (websocket connection)
      await conversation.startSession({
        signedUrl: data.signed_url,
        connectionType: "websocket",
        agentId: AGENT_ID,
      });

      console.log("✅ Session started successfully");
      return true;
    } catch (err: any) {
      console.error("Error starting interview:", err);
      setError(err.message);
      setConnectionStatus("error");
      connectionStatusRef.current = "error";
      addMessage("system", `❌ Error: ${err.message}`);
      onError?.(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [conversation, addMessage, onError]);

  // Stop interview
  const stopInterview = useCallback(async () => {
    await conversation.endSession();
    addMessage("system", "👋 Interview ended. Thank you!");
    setInterviewStartTime(null);
  }, [conversation, addMessage]);

  // Send a runtime message (violations) to the agent so it can respond
  // This uses sendUserMessage which treats it as a user message and prompts agent response
  const sendRuntimeMessage = useCallback(
    (message: string) => {
      // Check connection status using ref (immediate value)
      if (connectionStatusRef.current !== "connected") {
        console.warn(
          `⚠️ Cannot send message - not connected (status: ${connectionStatusRef.current})`
        );
        return false;
      }

      try {
        console.log("📤 Sending runtime message to agent:", message);
        
        // sendUserMessage sends as a user message, prompting agent to respond
        conversation.sendUserMessage(message);
        
        // Add system message to show the violation was detected
        addMessage("system", `⚠️ ${message}`);
        
        console.log("✅ Runtime message sent successfully");
        return true;
      } catch (e: any) {
        console.error("❌ Failed to send runtime message:", e);
        console.error("Error details:", e?.message, e?.stack);
        return false;
      }
    },
    [conversation, addMessage]
  );

  // Alternative: Send contextual update (agent is aware but doesn't treat as user message)
  // Use this if you don't want the message to appear as "user said this"
  const sendContextualUpdate = useCallback(
    (context: string) => {
      if (connectionStatusRef.current !== "connected") {
        console.warn(
          `⚠️ Cannot send contextual update - not connected (status: ${connectionStatusRef.current})`
        );
        return false;
      }

      try {
        console.log("📤 Sending contextual update to agent:", context);
        
        // sendContextualUpdate informs the agent without prompting immediate response
        // The agent will consider this context for the next response
        conversation.sendContextualUpdate(context);
        
        addMessage("system", `ℹ️ Context: ${context}`);
        
        console.log("✅ Contextual update sent successfully");
        return true;
      } catch (e: any) {
        console.error("❌ Failed to send contextual update:", e);
        return false;
      }
    },
    [conversation, addMessage]
  );

  // Calculate interview duration
  const getInterviewDuration = useCallback(() => {
    if (!interviewStartTime) return 0;
    return Math.floor((Date.now() - interviewStartTime.getTime()) / 1000);
  }, [interviewStartTime]);

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
    sendRuntimeMessage,
    sendContextualUpdate, // Added alternative method
    addMessage,
    getInterviewDuration,
    clearMessages: () => setMessages([]),
  };
}