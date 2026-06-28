import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Send, MessageSquare, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { askMachine } from "@/lib/chat.functions";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "When was the last failure?",
  "What is the current vibration status?",
  "When is next preventive maintenance?",
  "Why did the blow pin fail?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your assistant for **AHU-Quench SH1**. Ask me about parts, failures, vibration, or maintenance.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ask = useServerFn(askMachine);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { text: answer } = await ask({
        data: { messages: next.map((m) => ({ role: m.role, content: m.content })) },
      });
      setMessages([...next, { role: "assistant", content: answer }]);
    } catch (e) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "Sorry — I couldn't reach the AI service. " +
            (e instanceof Error ? e.message : "Please try again."),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 grid place-items-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Open machine assistant"
        >
          <MessageSquare className="size-6" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 sm:w-[400px] sm:h-[600px] sm:max-h-[85vh] bg-card sm:rounded-2xl border-0 sm:border border-border shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                <Bot className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">Machine Assistant</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  AHU-Quench SH1 · powered by Gemini
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="size-9 rounded-lg hover:bg-accent grid place-items-center shrink-0"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-strong:text-current [&_*]:text-current">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="pt-2 space-y-1.5">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-1">
                  Try asking
                </div>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-border p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] bg-card flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about this machine…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring max-h-32"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="size-10 shrink-0 rounded-xl bg-primary text-primary-foreground grid place-items-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
