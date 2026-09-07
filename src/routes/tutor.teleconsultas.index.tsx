import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { getTeleconsultas, getPets, getVets, getTutores } from "@/services/api";
import { formatTime, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/tutor/teleconsultas/")({
  head: () => ({ meta: [{ title: "Teleconsultas — PetHub" }] }),
  loader: async () => {
    const [allTele, pets, vets, tutores] = await Promise.all([
      getTeleconsultas(), getPets(), getVets(), getTutores()
    ]);
    const currentTutor = tutores[0] || null;
    const all = currentTutor ? allTele.filter(t => t.tutorId === (currentTutor.id || (currentTutor as any)._id)) : [];
    return { all, pets, vets };
  },
  component: List,
});

function List() {
  const { all, pets, vets } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes">("semana");
  const agendadas = useMemo(() => all.filter(t => t.status === "agendada"), [all]);
  const concluidas = useMemo(() => all.filter(t => t.status === "concluida"), [all]);
  const filtra = (list: typeof all) => list.filter(t => {
    if (!q) return true;
    const p = pets.find(pet => (pet.id || (pet as any)._id) === t.petId);
    const v = vets.find(vet => (vet.id || (vet as any)._id) === t.vetId);
    return (p?.nome + " " + v?.nome + " " + t.queixas).toLowerCase().includes(q.toLowerCase());
  });

  return (
    <>
      <PageHeader title="Teleconsultas" subtitle="Histórico e próximas consultas dos seus pets" actions={
        <Button className="rounded-md"><Plus className="h-4 w-4 mr-1" />Marcar teleconsulta</Button>
      } />
      <Card className="p-4 mb-6 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-10" placeholder="Buscar por pet, vet ou queixa..." value={q} onChange={e => setQ(e.target.value)} />
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
          <TabsTrigger value="hist">Histórico ({concluidas.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="agenda" className="mt-4 space-y-3">
          {filtra(agendadas).map(tc => <Row key={tc.id || (tc as any)._id} tc={tc} pets={pets} vets={vets} />)}
        </TabsContent>
        <TabsContent value="hist" className="mt-4 space-y-3">
          {filtra(concluidas).map(tc => <Row key={tc.id || (tc as any)._id} tc={tc} pets={pets} vets={vets} done />)}
        </TabsContent>
      </Tabs>
    </>
  );
}

function Row({ tc, done, pets, vets }: { tc: any; done?: boolean; pets: any[]; vets: any[] }) {
  const pet = pets.find(p => (p.id || (p as any)._id) === tc.petId);
  const vet = vets.find(v => (v.id || (v as any)._id) === tc.vetId);
  return (
    <Link to="/tutor/teleconsultas/$id" params={{ id: (tc.id || (tc as any)._id) as string }} className="block">
      <Card className="p-4 flex gap-4 items-center hover:border-primary/50">
        <div className="h-14 w-14 rounded-md bg-brand-deep/15 grid place-items-center text-3xl">{pet?.foto || '🐾'}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{pet?.nome || "Pet"} com {vet?.nome || "Vet"}</p>
          <p className="text-sm text-muted-foreground truncate">{vet?.especialidade || ""} — {tc.queixas}</p>
        </div>
        <div className="text-right">
          {done ? <Badge variant="secondary">Concluída</Badge>
            : <p className="font-display text-base flex items-center gap-1 justify-end"><Clock className="h-4 w-4 text-brand-deep" />{formatTime(tc.data)}</p>}
          <p className="text-xs text-muted-foreground mt-1">{formatDate(tc.data)} às {formatTime(tc.data)}</p>
        </div>
      </Card>
    </Link>
  );
}