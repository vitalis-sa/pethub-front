import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Bot, User } from "lucide-react";

type Msg = { role: "user" | "ai"; content: string };

export function AIChatMock({ context, petId, petName, title = "Assistente IA Veterinária" }: { context: string; petId?: string; petName: string; title?: string }) {
  const storageKey = `aichat:${context}`;
  const [messages, setMessages] = useState<Msg[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(messages)); }, [messages, storageKey]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setMessages(m => [...m, { role: "user", content: text }]);
    setInput("");
    setThinking(true);

    try {
      // Faz a chamada real para o seu Webhook do n8n
      const response = await fetch("http://localhost:5678/webhook/40a6fd5d-796c-438e-a732-fdb57caeeb7e/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Se usar o Chat Trigger do n8n, ele costuma esperar 'chatInput' e 'sessionId'. 
        // Se for um Webhook normal, você pode ler a propriedade 'message' lá no n8n.
        body: JSON.stringify({
          action: "sendMessage",
          sessionId: context,
          petId: petId, // Passa apenas o id
          chatInput: text,
          message: text
        })
      });

      if (!response.ok) throw new Error("Erro na rede");
      const data = await response.json();

      // Ajuste 'data.output' conforme a resposta do seu n8n (ex: data.text, data.response, etc)
      const aiReply = data.output || data.text || data.response || data.data || "Nenhuma resposta do n8n (verifique o nó 'Respond to Webhook').";
      setMessages(m => [...m, { role: "ai", content: aiReply }]);
    } catch (error) {
      setMessages(m => [...m, { role: "ai", content: "Erro de comunicação com o n8n. Verifique se o workflow está ativo." }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <Card className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />{title}</h2>
        <Badge variant="outline" className="text-xs">Integrado com n8n</Badge>
      </div>

      <div className="flex-1 min-h-[280px] max-h-[420px] overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Olá! Sou o assistente de IA. Como posso ajudar com o(a) {petName}?
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && <div className="h-7 w-7 rounded-md bg-primary/10 grid place-items-center shrink-0"><Bot className="h-4 w-4 text-primary" /></div>}
            <div className={`rounded-md px-4 py-2 text-sm max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {m.role === "ai" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
            {m.role === "user" && <div className="h-7 w-7 rounded-md bg-secondary grid place-items-center shrink-0"><User className="h-4 w-4" /></div>}
          </div>
        ))}
        {thinking && (
          <div className="flex gap-2">
            <div className="h-7 w-7 rounded-md bg-primary/10 grid place-items-center"><Bot className="h-4 w-4 text-primary" /></div>
            <div className="rounded-md px-4 py-2 text-sm bg-secondary text-muted-foreground">Pensando...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={`Pergunte algo sobre ${petName}...`}
          className="min-h-[60px] resize-none"
        />
        <Button onClick={send} disabled={!input.trim() || thinking} size="icon" className="h-10 w-10 shrink-0"><Send className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}
