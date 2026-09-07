import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, VideoOff, Video as VideoIcon, PhoneOff, Sparkles, Stethoscope, FileCheck } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { getTeleconsulta, getPet, getTutor } from "@/services/api";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSymptomExtraction } from "@/hooks/useSymptomExtraction";
import { useDiagnosisStream } from "@/hooks/useDiagnosisStream";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/vet/teleconsultas/$id/live")({
  head: () => ({ meta: [{ title: "Teleconsulta ao vivo" }] }),
  loader: async ({ params }) => {
    try {
      const tc = await getTeleconsulta(params.id);
      const pet = await getPet(tc.petId);
      const tutor = await getTutor(tc.tutorId);
      return { tc, pet, tutor };
    } catch {
      throw notFound();
    }
  },
  component: TeleLive,
  notFoundComponent: () => <p>Teleconsulta não encontrada.</p>,
});

function TeleLive() {
  const { tc, pet, tutor } = Route.useLoaderData();
  const id = tc.id || (tc as any)._id as string;
  const navigate = useNavigate();
  const localRef = useRef<HTMLVideoElement>(null);
  const [streamErr, setStreamErr] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  const [sintomasManuais, setSintomasManuais] = useState("");
  const [sintomasConfirmados, setSintomasConfirmados] = useState<string[]>([]);
  const [sintomasRejeitados, setSintomasRejeitados] = useState<string[]>([]);

  const { transcript, isListening, startListening, stopListening, isSupported } = useSpeechRecognition();
  const fullTextToExtract = `${tc.sintomasRelatados ?? tc.queixas ?? ""} ${transcript}`;
  const { extractedData, isExtracting } = useSymptomExtraction(fullTextToExtract);
  const { streamText, isLoading, startAnalysis } = useDiagnosisStream();

  useEffect(() => {
    let active = true; let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(s => { if (!active) { s.getTracks().forEach(t => t.stop()); return; } stream = s; if (localRef.current) localRef.current.srcObject = s; })
      .catch(e => setStreamErr(e?.message ?? "Não foi possível acessar a câmera"));
    return () => { active = false; stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    if (isSupported && micOn && !isListening) {
      startListening();
    }
  }, [isSupported, micOn, isListening, startListening]);

  const toggle = (kind: "audio" | "video") => {
    const s = localRef.current?.srcObject as MediaStream | null;
    s?.getTracks().filter(t => t.kind === kind).forEach(t => (t.enabled = !t.enabled));
    if (kind === "audio") {
      setMicOn(v => !v);
      if (micOn) stopListening();
      else startListening();
    } else {
      setCamOn(v => !v);
    }
  };

  const extractedArray = useMemo(() => {
    if (!extractedData) return [];
    const list: string[] = [];
    if (extractedData.sintoma1) list.push(extractedData.sintoma1);
    if (extractedData.sintoma2) list.push(extractedData.sintoma2);
    if (extractedData.sintoma3) list.push(extractedData.sintoma3);
    if (extractedData.sintoma4) list.push(extractedData.sintoma4);
    if (extractedData.vomito) list.push("Vômito");
    if (extractedData.diarreia) list.push("Diarreia");
    if (extractedData.perdaApetite) list.push("Perda de apetite");
    if (extractedData.tosse) list.push("Tosse");
    return Array.from(new Set(list));
  }, [extractedData]);

  const pendingSymptoms = extractedArray.filter(s => !sintomasConfirmados.includes(s) && !sintomasRejeitados.includes(s));

  return (
    <div className="absolute inset-0 top-14 lg:top-0 lg:left-64 bg-background p-4 sm:p-6 lg:p-8 grid lg:grid-cols-[1fr_360px] gap-6 z-10">
      {/* Video area */}
      <div className="flex flex-col gap-4 h-full">
        <div className="relative rounded-md overflow-hidden bg-black flex-1 grid place-items-center text-white">
          <div className="text-9xl opacity-60">{pet.foto}</div>
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur text-xs flex items-center gap-2 text-white">
            <span className="h-2 w-2 rounded-md bg-success animate-pulse" /> Ao vivo · {tutor.nome}
          </div>
          {/* Local PiP */}
          <div className="absolute bottom-4 right-4 w-32 sm:w-40 lg:w-56 aspect-video rounded-md overflow-hidden border-2 border-white/20 bg-black">
            {streamErr ? (
              <div className="h-full grid place-items-center text-xs p-3 text-center">{streamErr}</div>
            ) : (
              <video ref={localRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            )}
            <div className="absolute bottom-1 left-2 text-[10px] opacity-80 text-white">Você (Vet)</div>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button size="lg" variant={micOn ? "secondary" : "destructive"} className="rounded-md" onClick={() => toggle("audio")}>
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button size="lg" variant={camOn ? "secondary" : "destructive"} className="rounded-md" onClick={() => toggle("video")}>
            {camOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button size="lg" variant="destructive" className="rounded-md px-6" onClick={() => {
            if (streamText) localStorage.setItem(`laudo-${id}`, streamText);
            navigate({ to: "/vet/teleconsultas/$id/finalizar", params: { id } });
          }}>
            <PhoneOff className="h-5 w-5 mr-2" />Encerrar
          </Button>
        </div>
      </div>

      {/* Sidebar prontuário */}
      <aside className="space-y-3 overflow-y-auto max-h-[calc(100vh-3rem)] pr-2">
        {/* 1. Pet Info */}
        <Card className="p-4 bg-card text-card-foreground">
          <div className="flex gap-3 items-center">
            <div className="h-12 w-12 rounded-md bg-brand-deep/15 grid place-items-center text-2xl">{pet.foto}</div>
            <div>
              <p className="font-display text-lg leading-none">{pet.nome}</p>
              <p className="text-xs text-muted-foreground mt-1">{pet.raca} · {pet.idade}a · {pet.peso}kg</p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-3 flex-wrap">
            <Badge variant="secondary">{pet.especie}</Badge>
            <Badge variant="outline">{pet.sexo === "M" ? "Macho" : "Fêmea"}</Badge>
          </div>
        </Card>

        {/* 2. Sintomas */}
        <Card className="p-4 bg-card text-card-foreground">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Sintomas</h3>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-1 mt-2">
              {sintomasConfirmados.length === 0 && <span className="text-xs text-muted-foreground">Nenhum sintoma confirmado.</span>}
              {sintomasConfirmados.map((s, i) => <Badge key={i} variant="default">{s}</Badge>)}
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Input 
              value={sintomasManuais} 
              onChange={e => setSintomasManuais(e.target.value)} 
              placeholder="Adicione outros sintomas aqui..." 
              className="text-sm" 
              onKeyDown={e => {
                if (e.key === 'Enter' && sintomasManuais.trim()) {
                  e.preventDefault();
                  setSintomasConfirmados(prev => [...prev, sintomasManuais.trim()]);
                  setSintomasManuais("");
                }
              }}
            />
            <Button 
              size="sm" 
              onClick={() => {
                if (sintomasManuais.trim()) {
                  setSintomasConfirmados(prev => [...prev, sintomasManuais.trim()]);
                  setSintomasManuais("");
                }
              }}
            >Adicionar</Button>
          </div>
        </Card>

        {/* 3. Validação IA */}
        <Card className="p-4 bg-card text-card-foreground">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Validação da IA</h3>

          {pendingSymptoms.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium mb-1">Confirme os sintomas detectados:</p>
              {pendingSymptoms.map(s => (
                <div key={s} className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <span className="text-sm font-medium">{s}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-success hover:bg-success/20 hover:text-success" onClick={() => setSintomasConfirmados(prev => [...prev, s])}>✓</Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/20 hover:text-destructive" onClick={() => setSintomasRejeitados(prev => [...prev, s])}>✕</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-xs text-muted-foreground mt-2">Nenhum sintoma pendente.</p>
          )}
        </Card>

        {/* 4. Laudo IA */}
        <Card className="p-4 bg-card text-card-foreground flex flex-col max-h-[400px]">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2 shrink-0"><Sparkles className="h-3 w-3" />Laudo Gerado (IA)</h3>
          {streamText ? (
            <div className="flex flex-col overflow-hidden">
              <div className="text-sm text-muted-foreground overflow-y-auto pr-2 [&>h3]:font-bold [&>h3]:text-foreground [&>h3]:mt-3 [&>h3]:mb-1 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>strong]:text-foreground">
                <ReactMarkdown>{streamText}</ReactMarkdown>
              </div>
              <div className="mt-3 shrink-0 inline-flex items-center gap-2 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium border border-primary/20">
                Acurácia do modelo preditivo: 85%
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">O diagnóstico preditivo aparecerá aqui após análise.</p>
          )}
          {isLoading && <span className="text-xs text-primary animate-pulse mt-2 block">Gerando laudo...</span>}
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full mt-4"
            onClick={() => {
              const allSymptoms = [...sintomasConfirmados];
              if (sintomasManuais.trim()) allSymptoms.push(sintomasManuais.trim());
              startAnalysis({
                perdaApetite: null, vomito: null, diarreia: null, tosse: null, 
                dificuldadeRespiratoria: null, claudicacao: null, lesoesPele: null, 
                secrecaoNasal: null, secrecaoOcular: null,
                sintoma1: allSymptoms[0] || null,
                sintoma2: allSymptoms[1] || null,
                sintoma3: allSymptoms[2] || null,
                sintoma4: allSymptoms[3] || null,
                analiseGenAI: allSymptoms.slice(4).join(', ') || null
              } as any);
            }}
            disabled={isLoading || (sintomasConfirmados.length === 0 && !sintomasManuais)}
          >
            Gerar Laudo Preditivo
          </Button>
        </Card>

        {/* 5. Diagnóstico Provável */}
        <Card className="p-4 bg-card text-card-foreground">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-2"><Stethoscope className="h-3 w-3" />Diagnóstico provável</h3>
          <Textarea placeholder="Sua hipótese diagnóstica final..." className="min-h-[80px] text-sm" />
        </Card>

      </aside>
    </div>
  );
}
