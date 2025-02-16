"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [documentText, setDocumentText] = useState("");

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!documentText.trim()) {
      return alert("Please paste your document text first");
    }
    const newMessages = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("/api/langchain-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, documentText }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: "gemini", content: data.answer }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([...newMessages, { role: "gemini", content: "Failed to fetch response" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-gray-900 text-white p-6 gap-6">
      {/* Left Side - Document Input */}
      <Card className="w-1/2 bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Paste Your Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your text here..."
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            required
            className="h-64"
          />
        </CardContent>
      </Card>

      {/* Right Side - Chat System */}
      <Card className="w-1/2 flex flex-col bg-white text-black">
        <CardHeader className="bg-gray-900 text-white text-center">
          <CardTitle>Chat with Your Document</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-3" ref={chatContainerRef}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 max-w-[75%] rounded-lg ${
                msg.role === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-300 text-gray-800 self-start"
              }`}
            >
              <strong>{msg.role === "user" ? "You" : "Gemini"}:</strong> {msg.content}
            </div>
          ))}
        </CardContent>

        {/* Chat Input */}
        <CardContent className="bg-gray-100 shadow-md flex items-center p-4 gap-3">
          <Input
            type="text"
            placeholder="Ask something about the document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="flex-1"
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
