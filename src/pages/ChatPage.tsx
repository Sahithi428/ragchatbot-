import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Bot, User, Sparkles, Filter, Trash2, Bookmark, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { ChatMessage, Citation } from '../types';
import { CitationCard } from '../components/CitationCard';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useProfileContext, setUseProfileContext] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}`);

  const samplePrompts = [
    "Find remote data science internships for sophomores",
    "Scholarships for engineering majors with a 3.5 GPA",
    "Internships with over $45/hr stipend",
    "Scholarships closing in less than 14 days"
  ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle URL query parameter `?q=...` from landing page click
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    } else if (messages.length === 0) {
      // Welcome message
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'assistant',
          content: "Hello! I am **StudentPath**, your AI internship and scholarship advisor. Ask me anything like *'find remote CS internships'* or *'scholarships for 3.5 GPA'*, and I will filter and match verified, non-hallucinated listings for you.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [searchParams]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    setError(null);
    const userMsgId = `user_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage(textToSend, useProfileContext, sessionIdRef.current);
      
      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        content: response.answer,
        citations: response.citations,
        structured_filters: response.structured_filters_applied,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setError("Failed to connect to RAG backend. Make sure FastAPI server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkCitation = async (opportunityId: number) => {
    try {
      await api.saveOrUpdateApplication({ opportunity_id: opportunityId, status: 'saved' });
      alert("Opportunity saved to your Dashboard tracker!");
    } catch (err) {
      alert("Failed to save opportunity.");
    }
  };

  const clearChat = () => {
    sessionIdRef.current = `session_${Date.now()}`;
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'assistant',
        content: "Chat cleared! How can I help you find opportunities today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Header & Settings bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3.5 shadow-lg flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              StudentPath Conversational RAG
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                Multi-Turn Memory
              </span>
            </h2>
            <p className="text-xs text-slate-400">Strict Metadata Grounding • Zero Hallucination Guard</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 cursor-pointer select-none text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={useProfileContext}
              onChange={(e) => setUseProfileContext(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Apply Student Profile Defaults</span>
          </label>

          <button
            onClick={clearChat}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6 shadow-inner">
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 sm:gap-4 max-w-4xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-md ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-slate-800 to-slate-700 text-indigo-300 border border-slate-600'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`space-y-3 max-w-[85%] sm:max-w-[75%]`}>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {/* Structured Filters Tag if present */}
                {msg.structured_filters && Object.keys(msg.structured_filters).length > 0 && (
                  <div className="mb-2.5 pb-2 border-b border-slate-800/80 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="text-slate-400 font-medium">Applied Filters:</span>
                    {Object.entries(msg.structured_filters).map(([k, v]) => (
                      <span key={k} className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message Content with line breaks */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {/* Citations Grid rendered as Chips */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Verified Source Listings ({msg.citations.length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {msg.citations.map((citation) => (
                      <CitationCard
                        key={citation.id}
                        citation={citation}
                        onSave={handleBookmarkCitation}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading / Typing Indicator */}
        {loading && (
          <div className="flex gap-3 max-w-2xl">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Querying database, applying hard eligibility filters & ranking ChromaDB vector embeddings...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts Pill Bar */}
      <div className="py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200 transition-colors shrink-0"
          >
            + {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask e.g. 'find remote cs internships for sophomores' or 'scholarships with $10k award'..."
          disabled={loading}
          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl pl-5 pr-14 py-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xl"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-3.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
