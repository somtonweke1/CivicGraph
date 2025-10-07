"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, Sparkles, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
};

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your CivicGraph assistant. I can help you find civic actions, discover opportunities in your area, or answer questions about community engagement. How can I help you today?",
      timestamp: new Date(),
      suggestions: [
        "What actions can I do today?",
        "Show me high-impact opportunities",
        "What's trending in my area?",
        "How do I increase my rank?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Simulate AI response - in production, call your AI API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = generateAIResponse(messageText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = (userInput: string): { content: string; suggestions?: string[] } => {
    const input = userInput.toLowerCase();

    if (input.includes("action") || input.includes("do")) {
      return {
        content: "🎯 Here are some impactful actions you can take right now:\n\n1. **Food Security** - Organize a community food share (15 points)\n2. **Sustainability** - Start a neighborhood composting initiative (12 points)\n3. **Education** - Host a skill-sharing workshop (13 points)\n\nWhich one interests you most?",
        suggestions: [
          "Tell me more about food sharing",
          "How do I start composting?",
          "What makes high impact?",
        ],
      };
    }

    if (input.includes("trend") || input.includes("popular")) {
      return {
        content: "📈 Trending civic actions this week:\n\n🏠 **Housing**: 43% increase in co-housing info sessions\n🌱 **Sustainability**: Urban gardens are booming (+67%)\n❤️ **Mutual Aid**: Food drives remain top-impact\n\nThese categories are perfect for maximizing your impact points!",
        suggestions: [
          "Show housing opportunities",
          "Find urban garden near me",
          "How to join mutual aid?",
        ],
      };
    }

    if (input.includes("rank") || input.includes("leaderboard")) {
      return {
        content: "🏆 To climb the leaderboard:\n\n1. **Consistency** - Log actions daily for streak bonuses\n2. **Diversity** - Try different categories for achievement points\n3. **Verification** - Get actions verified for 2x points\n4. **High-Impact** - Focus on Emergency Response and Infrastructure (15 points)\n\nCurrent top earners are averaging 3 actions per week!",
        suggestions: [
          "Show achievement progress",
          "What's my current streak?",
          "How to get verified?",
        ],
      };
    }

    if (input.includes("area") || input.includes("location")) {
      return {
        content: "📍 Based on your location, here are active opportunities:\n\n• **Mission District** - Community garden project (starting this weekend)\n• **SOMA** - Tech literacy workshop for seniors (Thursdays)\n• **Tenderloin** - Food distribution program (daily, 5-7pm)\n\nWould you like details on any of these?",
        suggestions: [
          "Community garden details",
          "Sign up for workshop",
          "Food distribution info",
        ],
      };
    }

    return {
      content: "I can help you with:\n\n✨ Finding meaningful civic actions\n📊 Understanding impact strategies\n🗺️ Discovering local opportunities\n🏆 Improving your leaderboard rank\n\nWhat would you like to explore?",
      suggestions: [
        "Find actions for me",
        "Explain impact points",
        "Show local events",
      ],
    };
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              className="rounded-full h-16 w-16 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-500 items-center justify-center text-xs font-bold text-white">
                  AI
                </span>
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md"
          >
            <Card className="shadow-2xl border-2">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Assistant</CardTitle>
                      <CardDescription className="text-white/80">
                        Your civic engagement guide
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className={message.role === "assistant" ? "bg-purple-600" : "bg-blue-600"}>
                        <AvatarFallback className="text-white">
                          {message.role === "assistant" ? "AI" : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                        </div>
                        {message.suggestions && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handleSend(suggestion)}
                              >
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3">
                      <Avatar className="bg-purple-600">
                        <AvatarFallback className="text-white">AI</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted p-3 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      disabled={loading}
                    />
                    <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
