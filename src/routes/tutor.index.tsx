import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Bell, User, ArrowRight, Clock } from "lucide-react";
import { getPets, getTeleconsultas, getVets, getTutores } from "@/services/api";
import { formatTime, formatDate } from "@/lib/utils";

// Lembretes ainda não possuem endpoint no swagger, então vamos manter um mock local só pra eles se precisar, ou vazio.
const lembretesMock: any[] = [];

export const Route = createFileRoute("/tutor/")({
  head: () => ({ meta: [{ title: "Início — PetHub Tutor" }] }),
  loader: async () => {
    const [tutoresData, petsData, teleconsultasData, vetsData] = await Promise.all([
      getTutores(), getPets(), getTeleconsultas(), getVets()
    ]);
    const currentTutor = tutoresData[0] || null;
    const pets = currentTutor ? petsData.filter(p => p.tutorId === (currentTutor.id || (currentTutor as any)._id)) : [];
    return { currentTutor, pets, teleconsultasData, vetsData };
  },
  component: TutorHome,
});

function TutorHome() {
  const { currentTutor, pets, teleconsultasData, vetsData } = Route.useLoaderData();

  if (!currentTutor) {
    return <div className="p-10 text-center text-muted-foreground">Nenhum tutor encontrado. Cadastre um tutor primeiro.</div>;
  }

  const proximas = teleconsultasData
    .filter(t => t.status === "agendada" && (pets.some(p => (p.id || (p as any)._id) === t.petId)))
    .sort((a, b) => (a.data || "").localeCompare(b.data || ""))
    .slice(0, 2);
  const meusLembretes = lembretesMock.filter(l => pets.some(p => (p.id || (p as any)._id) === l.petId)).slice(0, 3);

  const atalhos = [
    { to: "/tutor/teleconsultas", icon: Video, label: "Teleconsultas", desc: `${proximas.length} agendadas` },
    { to: "/tutor/lembretes", icon: Bell, label: "Lembretes", desc: `${meusLembretes.length} ativos` },
    { to: "/tutor/perfil", icon: User, label: "Meu perfil", desc: "Editar dados" },
  ];

  return (
    <>
      <PageHeader title={`Oi, ${currentTutor.nome.split(" ")[0]} 👋`} subtitle="Aqui estão seus bichinhos e os próximos cuidados." />

      <h2 className="font-display text-xl mb-3">Meus pets</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {pets.map(p => (
          <Link key={p.id} to="/tutor/pets/$petId" params={{ petId: p.id }} className="block">
            <Card className="p-5 hover:shadow-[var(--shadow-soft)] hover:border-primary/50 transition-all h-full">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-md bg-brand-deep/15 grid place-items-center text-5xl">{p.foto}</div>
                <div>
                  <p className="font-display text-2xl">{p.nome}</p>
                  <p className="text-sm text-muted-foreground">{p.raca}</p>
                  <div className="flex gap-1.5 mt-2"><Badge variant="secondary">{p.especie}</Badge><Badge variant="outline">{p.idade}a</Badge></div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {atalhos.map(a => {
          const I = a.icon;
          return (
            <Link key={a.to} to={a.to} className="block">
              <Card className="p-5 hover:border-primary/50 transition-colors group cursor-pointer h-full">
                <div className="h-11 w-11 rounded-md bg-brand-deep/15 grid place-items-center text-brand-deep"><I className="h-5 w-5" /></div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {proximas.length > 0 && (
        <>
          <h2 className="font-display text-xl mt-10 mb-3">Próximas teleconsultas</h2>
          <div className="space-y-3">
            {proximas.map(tc => {
              const pet = pets.find(p => (p.id || (p as any)._id) === tc.petId);
              const vet = vetsData.find(v => (v.id || (v as any)._id) === tc.vetId);
              return (
                <Link key={tc.id || (tc as any)._id} to="/tutor/teleconsultas/$id" params={{ id: (tc.id || (tc as any)._id) as string }} className="block">
                  <Card className="p-4 flex gap-4 items-center hover:border-primary/50">
                    <div className="h-12 w-12 rounded-md bg-brand-deep/15 grid place-items-center text-2xl">{pet?.foto || '🐾'}</div>
                    <div className="flex-1">
                      <p className="font-medium">{pet?.nome || "Pet"} com {vet?.nome || "Vet"}</p>
                      <p className="text-xs text-muted-foreground">{vet?.especialidade || ""}</p>
                    </div>
                    <p className="text-sm flex items-center gap-1"><Clock className="h-4 w-4 text-brand-deep" />{formatDate(tc.data)} às {formatTime(tc.data)}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {meusLembretes.length > 0 && (
        <>
          <h2 className="font-display text-xl mt-10 mb-3">Lembretes</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {meusLembretes.map(l => (
              <Card key={l.id} className="p-4">
                <Badge variant="outline" className="capitalize">{l.tipo}</Badge>
                <p className="font-medium mt-2">{l.titulo}</p>
                <p className="text-xs text-muted-foreground">{formatDate(l.data)}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </>
  );
}
