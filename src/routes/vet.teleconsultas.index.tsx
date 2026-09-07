import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Clock, Video, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { getTeleconsultas, getPets, getTutores, createTeleconsulta } from "@/services/api";
import { formatTime, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/vet/teleconsultas/")({
  head: () => ({ meta: [{ title: "Teleconsultas — PetHub Vet" }] }),
  loader: async () => {
    const [teleconsultas, pets, tutores] = await Promise.all([
      getTeleconsultas(), getPets(), getTutores()
    ]);
    return { teleconsultas, pets, tutores };
  },
  component: TeleList,
  pendingComponent: () => (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-3 text-muted-foreground">Carregando teleconsultas...</span>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-destructive">
      <h2 className="text-lg font-bold">Erro ao carregar teleconsultas</h2>
      <p className="mt-2 text-sm">{error?.message || "Servidor indisponível no momento."}</p>
    </div>
  ),
});

function TeleList() {
  const router = useRouter();
  const { teleconsultas, pets, tutores } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes">("semana");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ petId: "", data: "", duracaoMin: 30, queixas: "" });

  const agendadas = useMemo(() => teleconsultas.filter(t => t.status === "agendada"), [teleconsultas]);
  const concluidas = useMemo(() => teleconsultas.filter(t => t.status === "concluida"), [teleconsultas]);

  const filtra = (list: typeof teleconsultas) => list.filter(t => {
    if (!q) return true;
    const p = pets.find(pet => (pet.id || (pet as any)._id) === t.petId);
    const tu = tutores.find(tutor => (tutor.id || (tutor as any)._id) === t.tutorId);
    return (p?.nome + " " + tu?.nome + " " + t.queixas).toLowerCase().includes(q.toLowerCase());
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petId || !formData.data) return toast.error("Preencha pet e data");
    
    setIsSubmitting(true);
    try {
      const pet = pets.find(p => (p.id || (p as any)._id) === formData.petId);
      await createTeleconsulta({
        ...formData,
        tutorId: pet?.tutorId,
        vetId: "current-vet", // Mock
        data: new Date(formData.data).toISOString()
      });
      toast.success("Teleconsulta agendada");
      setIsModalOpen(false);
      setFormData({ petId: "", data: "", duracaoMin: 30, queixas: "" });
      router.invalidate();
    } catch (err: any) {
      toast.error("Erro ao agendar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Teleconsultas" subtitle="Agenda e histórico de atendimentos remotos" actions={
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-md"><Plus className="h-4 w-4 mr-1" />Nova teleconsulta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Teleconsulta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Pet</Label>
                <Select value={formData.petId} onValueChange={(val) => setFormData({ ...formData, petId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um pet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map(p => (
                      <SelectItem key={p.id || (p as any)._id} value={(p.id || (p as any)._id) as string}>{p.nome} - {p.raca}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input type="datetime-local" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Motivo / Queixas</Label>
                <Textarea placeholder="Qual o motivo da consulta?" value={formData.queixas} onChange={e => setFormData({ ...formData, queixas: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Agendar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      } />

      <Card className="p-4 mb-6 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar por pet, tutor ou queixa..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {(["dia","semana","mes"] as const).map(p => (
            <button key={p} onClick={() => setPeriodo(p)} className={`px-4 py-1.5 rounded-md text-sm capitalize ${periodo===p?"bg-card shadow-sm":"text-muted-foreground"}`}>{p}</button>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="agenda">
        <TabsList>
          <TabsTrigger value="agenda">Agenda ({agendadas.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico ({concluidas.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="agenda" className="mt-4 space-y-3">
          {filtra(agendadas).map(tc => <TeleRow key={tc.id || (tc as any)._id} tc={tc} pets={pets} tutores={tutores} />)}
        </TabsContent>
        <TabsContent value="historico" className="mt-4 space-y-3">
          {filtra(concluidas).map(tc => <TeleRow key={tc.id || (tc as any)._id} tc={tc} pets={pets} tutores={tutores} done />)}
        </TabsContent>
      </Tabs>
    </>
  );
}

function TeleRow({ tc, done, pets, tutores }: { tc: any; done?: boolean; pets: any[]; tutores: any[] }) {
  const pet = pets.find(p => (p.id || (p as any)._id) === tc.petId);
  const tutor = tutores.find(t => (t.id || (t as any)._id) === tc.tutorId);
  return (
    <Link to="/vet/teleconsultas/$id" params={{ id: (tc.id || (tc as any)._id) as string }} className="block">
      <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors">
        <div className="h-14 w-14 rounded-md bg-brand-deep/15 grid place-items-center text-3xl">{pet?.foto || '🐾'}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{pet?.nome || "Pet"} <span className="text-muted-foreground font-normal">· {pet?.especie || ""}</span></p>
          <p className="text-sm text-muted-foreground truncate">Tutor: {tutor?.nome || "Desconhecido"} — {tc.queixas}</p>
        </div>
        <div className="text-right">
          {done ? (
            <Badge variant="secondary">Concluída</Badge>
          ) : (
            <p className="font-display text-base flex items-center gap-1 justify-end"><Clock className="h-4 w-4 text-brand-deep" />{formatTime(tc.data)}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{formatDate(tc.data)} às {formatTime(tc.data)}</p>
        </div>
        {!done && <Video className="h-5 w-5 text-brand-deep" />}
      </Card>
    </Link>
  );
}