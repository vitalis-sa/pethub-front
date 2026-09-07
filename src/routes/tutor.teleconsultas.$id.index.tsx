import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, FlaskConical, Video } from "lucide-react";
import { getTeleconsulta, getPet, getVet } from "@/services/api";
import { formatTime, formatDate } from "@/lib/utils";

export const Route = createFileRoute("/tutor/teleconsultas/$id/")({
  head: () => ({ meta: [{ title: "Teleconsulta — PetHub" }] }),
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
  component: TutorTeleInfo,
  notFoundComponent: () => <p>Teleconsulta não encontrada.</p>,
});

function TutorTeleInfo() {
  const { tc, pet, vet } = Route.useLoaderData();
  const id = tc.id || (tc as any)._id as string;

  return (
    <>
      <Link to="/tutor/teleconsultas" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 overflow-hidden relative text-brand-deep-foreground" style={{ background: "var(--gradient-deep)" }}>
            <div className="relative flex justify-between items-start flex-wrap gap-4">
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 rounded-md bg-brand-deep/15 grid place-items-center text-4xl">{vet.foto}</div>
                <div>
                  <h1 className="font-display text-2xl">{vet.nome}</h1>
                  <p className="text-sm opacity-80">{vet.especialidade} · {vet.crmv}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80">Marcada para</p>
                <p className="font-display text-lg flex items-center gap-1 justify-end"><Clock className="h-4 w-4" />{formatDate(tc.data)} às {formatTime(tc.data)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg mb-3">Conte ao veterinário o que está acontecendo</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Queixas / o que motivou a consulta</Label>
                <Textarea defaultValue={tc.queixas} className="min-h-[100px]" />
              </div>
              <Button>Salvar atualizações</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg flex items-center gap-2 mb-3"><FlaskConical className="h-4 w-4 text-primary" />Histórico recente de {pet.nome}</h2>
            <ul className="space-y-2 text-sm">
              {(pet.historico || []).map(h => (
                <li key={h.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                  <span>{h.motivo}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(h.data)}</span>
                </li>
              ))}
              {(!pet.historico || pet.historico.length === 0) && <p className="text-muted-foreground">Sem registros.</p>}
            </ul>
            {(pet.exames && pet.exames.length > 0) && (
              <>
                <h3 className="text-sm font-medium mt-5 mb-2">Últimos exames</h3>
                <ul className="text-sm space-y-1">
                  {pet.exames.map(e => <li key={e.id} className="flex justify-between"><span>{e.nome}</span><span className="text-muted-foreground text-xs">{formatDate(e.data)}</span></li>)}
                </ul>
              </>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <p className="text-xs text-muted-foreground">Pet</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-12 w-12 rounded-md bg-brand-deep/15 grid place-items-center text-2xl">{pet.foto}</div>
              <div>
                <p className="font-display text-lg">{pet.nome}</p>
                <p className="text-xs text-muted-foreground">{pet.raca} · {pet.idade}a</p>
              </div>
            </div>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              <Badge variant="secondary">{pet.especie}</Badge>
              <Badge variant="outline">{pet.peso} kg</Badge>
            </div>
          </Card>
          {tc.status === "agendada" && (
            <Link to="/tutor/teleconsultas/$id/live" params={{ id }} className="block">
              <Button className="w-full rounded-md bg-brand-deep text-brand-deep-foreground hover:bg-brand-deep/90" size="lg">
                <Video className="h-4 w-4 mr-2" />Entrar na sala
              </Button>
            </Link>
          )}
          <Button variant="outline" className="w-full">Remarcar</Button>
        </div>
      </div>
    </>
  );
}
