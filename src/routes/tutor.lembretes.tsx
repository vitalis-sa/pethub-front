import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Syringe, Pill, Video } from "lucide-react";
import { getTutores, getPets } from "@/services/api";
import { formatDate } from "@/lib/utils";

// Lembretes ainda não tem api
const lembretes: any[] = [];

export const Route = createFileRoute("/tutor/lembretes")({
  head: () => ({ meta: [{ title: "Lembretes — PetHub" }] }),
  loader: async () => {
    const [tutoresData, petsData] = await Promise.all([getTutores(), getPets()]);
    const currentTutor = tutoresData[0] || null;
    const pets = currentTutor ? petsData.filter(p => p.tutorId === (currentTutor.id || (currentTutor as any)._id)) : [];
    return { pets, currentTutor };
  },
  component: Lembretes,
});

const icons = { vacina: Syringe, medicacao: Pill, consulta: Video } as const;

function Lembretes() {
  const { pets } = Route.useLoaderData();
  const meus = lembretes.filter(l => pets.some(p => (p.id || (p as any)._id) === l.petId));

  return (
    <>
      <PageHeader title="Lembretes" subtitle="Vacinas, medicações e consultas dos seus pets" actions={
        <Button className="rounded-md"><Plus className="h-4 w-4 mr-1" />Novo lembrete</Button>
      } />

      {meus.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground"><Bell className="h-8 w-8 mx-auto mb-3" />Você ainda não tem lembretes.</Card>
      ) : (
        <div className="space-y-3">
          {meus.map(l => {
            const pet = pets.find(p => (p.id || (p as any)._id) === l.petId);
            const I = icons[l.tipo as keyof typeof icons];
            return (
              <Card key={l.id} className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-primary/15 text-primary grid place-items-center"><I className="h-5 w-5" /></div>
                <div className="flex-1">
                  <p className="font-medium">{l.titulo}</p>
                  <p className="text-xs text-muted-foreground">{pet?.foto} {pet?.nome}</p>
                </div>
                <Badge variant="outline">{formatDate(l.data)}</Badge>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
