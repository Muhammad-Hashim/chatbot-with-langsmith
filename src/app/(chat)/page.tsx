"use client";
import { useState, useEffect, useRef } from "react";

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
    if(!documentText.trim()){
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
        body: JSON.stringify({ question , documentText }),
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
    <div className="w-screen h-screen flex bg-gray-900 text-white p-6">
  {/* Left Side - Document Input */}
  <div className="w-1/2 flex flex-col p-4 bg-gray-800 rounded-lg shadow-lg">
    <h2 className="text-lg font-bold mb-2">Paste Your Text</h2>
    <textarea
      placeholder="Paste your text here..."
      value={documentText}
      onChange={(e) => setDocumentText(e.target.value)}
      required
      className="flex-1 p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
    />
  </div>

  {/* Right Side - Chat System */}
  <div className="w-[60%] flex flex-col ml-6 bg-white text-black rounded-lg shadow-lg">
    {/* Header */}
    <header className="p-4 bg-gray-900 text-white text-center text-2xl font-bold rounded-t-lg">
      Chat with Your Document
    </header>

    {/* Chat Box */}
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto flex flex-col space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 max-w-[75%] rounded-lg ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-300 text-gray-800 self-start"
            }`}
          >
            <strong>{msg.role === "user" ? "You" : "Gemini"}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>

    {/* Chat Input */}
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 shadow-md flex items-center rounded-b-lg">
      <input
        type="text"
        placeholder="Ask something about the document..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
        className="flex-1 p-3 border rounded-lg bg-white focus:outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className="ml-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Thinking..." : "Send"}
      </button>
    </form>
  </div>
</div>

  );
}
