import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PawPrint, Users, Video, ArrowRight, Clock } from "lucide-react";
import { getPets, getTutores, getTeleconsultas, getVets } from "@/services/api";
import { formatTime } from "@/lib/utils";

export const Route = createFileRoute("/vet/")({
  head: () => ({ meta: [{ title: "Início — PetHub Vet" }] }),
  loader: async () => {
    const [petsData, tutoresData, teleconsultasData, vetsData] = await Promise.all([
      getPets().catch(() => []), 
      getTutores().catch(() => []), 
      getTeleconsultas().catch(() => []), 
      getVets().catch(() => [])
    ]);
    const currentVet = vetsData[0] || null;
    return { petsData, tutoresData, teleconsultasData, currentVet };
  },
  component: VetHome,
});

function VetHome() {
  const { petsData, tutoresData, teleconsultasData, currentVet } = Route.useLoaderData();

  const today = teleconsultasData
    .filter(t => t.status === "agendada")
    .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
    .slice(0, 4);

  const shortcuts = [
    { to: "/vet/pets", label: "Todos os pets", count: petsData.length, icon: PawPrint, hue: "bg-primary/15 text-primary" },
    { to: "/vet/tutores", label: "Todos os tutores", count: tutoresData.length, icon: Users, hue: "bg-accent/30 text-accent-foreground" },
    { to: "/vet/teleconsultas", label: "Teleconsultas", count: teleconsultasData.length, icon: Video, hue: "bg-secondary text-secondary-foreground" },
  ];

  return (
    <>
      <PageHeader title={`Olá, ${currentVet?.nome?.split(" ")[0] || "Vet"} 🐾`} subtitle="Aqui está um resumo do seu dia." />

      <div className="grid md:grid-cols-3 gap-4">
        {shortcuts.map(s => {
          const I = s.icon;
          return (
            <Link key={s.to} to={s.to} className="block">
              <Card className="p-6 hover:shadow-[var(--shadow-soft)] transition-shadow border-border group cursor-pointer h-full">
                <div className={`h-12 w-12 rounded-md grid place-items-center ${s.hue}`}><I className="h-5 w-5" /></div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="font-display text-3xl mt-1">{s.count}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-2xl">Agenda de hoje</h2>
          <Link to="/vet/teleconsultas" className="block"><Button variant="ghost" size="sm">Ver tudo <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
        </div>
        <div className="space-y-3">
          {today.length === 0 ? (
            <p className="text-sm text-muted-foreground">Não há teleconsultas agendadas para hoje.</p>
          ) : today.map(tc => {
            const pet = petsData.find(p => (p.id || (p as any)._id) === tc.petId);
            const tutor = tutoresData.find(t => (t.id || (t as any)._id) === tc.tutorId);
            return (
              <Link key={tc.id || (tc as any)._id} to="/vet/teleconsultas/$id" params={{ id: (tc.id || (tc as any)._id) as string }} className="block">
                <Card className="p-4 flex items-center gap-4 hover:border-primary/50 transition-colors">
                  <div className="h-14 w-14 rounded-md bg-brand-deep/15 grid place-items-center text-3xl">{pet?.foto || '🐾'}</div>
                  <div className="flex-1">
                    <p className="font-medium">{pet?.nome || "Pet desconhecido"} <span className="text-muted-foreground font-normal">· {pet?.raca || ""}</span></p>
                    <p className="text-sm text-muted-foreground">Tutor: {tutor?.nome || "Desconhecido"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg flex items-center gap-1 justify-end"><Clock className="h-4 w-4 text-brand-deep" />{formatTime(tc.data)}</p>
                    <p className="text-xs text-muted-foreground">{tc.duracaoMin} min</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
