import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, VideoOff, Video as VideoIcon, PhoneOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getTeleconsulta, getPet, getVet } from "@/services/api";

export const Route = createFileRoute("/tutor/teleconsultas/$id/live")({
  head: () => ({ meta: [{ title: "Teleconsulta ao vivo" }] }),
  loader: async ({ params }) => {
    try {
      const tc = await getTeleconsulta(params.id);
      const pet = await getPet(tc.petId);
      const vet = await getVet(tc.vetId);
      return { tc, pet, vet };
    } catch {
      throw notFound();
    }
  },
  component: TutorLive,
  notFoundComponent: () => <p>Teleconsulta não encontrada.</p>,
});

function TutorLive() {
  const { tc, pet, vet } = Route.useLoaderData();
  const id = tc.id || (tc as any)._id as string;
  const navigate = useNavigate();
  const localRef = useRef<HTMLVideoElement>(null);
  const [streamErr, setStreamErr] = useState<string | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    let active = true; let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then(s => { if (!active) { s.getTracks().forEach(t => t.stop()); return; } stream = s; if (localRef.current) localRef.current.srcObject = s; })
      .catch(e => setStreamErr(e?.message ?? "Não foi possível acessar a câmera"));
    return () => { active = false; stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  const toggle = (kind: "audio" | "video") => {
    const s = localRef.current?.srcObject as MediaStream | null;
    s?.getTracks().filter(t => t.kind === kind).forEach(t => (t.enabled = !t.enabled));
    if (kind === "audio") setMicOn(v => !v); else setCamOn(v => !v);
  };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 lg:-my-8 min-h-[calc(100vh-3.5rem)] lg:min-h-screen text-background p-3 sm:p-4 lg:p-6 grid lg:grid-cols-[1fr_320px] gap-4" style={{ background: "var(--brand-deep)" }}>
      <div className="flex flex-col gap-3">
        <div className="relative rounded-md overflow-hidden bg-black flex-1 grid place-items-center min-h-[300px]">
          <div className="text-9xl opacity-60">{vet.foto}</div>
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur text-xs flex items-center gap-2">
            <span className="h-2 w-2 rounded-md bg-success animate-pulse" /> Ao vivo · {vet.nome}
          </div>
          <div className="absolute bottom-4 right-4 w-32 sm:w-40 lg:w-56 aspect-video rounded-md overflow-hidden border-2 border-background/20 bg-black">
            {streamErr ? (
              <div className="h-full grid place-items-center text-xs p-3 text-center">{streamErr}</div>
            ) : (
              <video ref={localRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            )}
            <div className="absolute bottom-1 left-2 text-[10px] opacity-80">Você</div>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button size="lg" variant={micOn ? "secondary" : "destructive"} className="rounded-md" onClick={() => toggle("audio")}>
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button size="lg" variant={camOn ? "secondary" : "destructive"} className="rounded-md" onClick={() => toggle("video")}>
            {camOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button size="lg" variant="destructive" className="rounded-md px-6" onClick={() => navigate({ to: "/tutor/teleconsultas/$id", params: { id } })}>
            <PhoneOff className="h-5 w-5 mr-2" />Sair
          </Button>
        </div>
      </div>

      <aside className="space-y-3">
        <Card className="p-4 bg-card text-card-foreground">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Atendendo</p>
          <div className="flex gap-3 items-center mt-2">
            <div className="h-12 w-12 rounded-md bg-brand-deep/15 grid place-items-center text-2xl">{vet.foto}</div>
            <div>
              <p className="font-display text-lg leading-none">{vet.nome}</p>
              <p className="text-xs text-muted-foreground mt-1">{vet.especialidade}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-card text-card-foreground">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Pet</p>
          <div className="flex gap-3 items-center mt-2">
            <div className="h-12 w-12 rounded-md bg-brand-deep/15 grid place-items-center text-2xl">{pet.foto}</div>
            <div>
              <p className="font-display text-lg leading-none">{pet.nome}</p>
              <p className="text-xs text-muted-foreground mt-1">{pet.raca} · {pet.idade}a</p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-3 flex-wrap">
            <Badge variant="secondary">{pet.especie}</Badge>
            <Badge variant="outline">{pet.peso} kg</Badge>
          </div>
        </Card>
        <Card className="p-4 bg-card text-card-foreground">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Suas queixas</h3>
          <p className="text-sm">{tc.queixas}</p>
        </Card>
      </aside>
    </div>
  );
}
