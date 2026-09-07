import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Clock, AlertCircle, FlaskConical } from "lucide-react";
import { getTeleconsulta, getPet, getTutor } from "@/services/api";
import { formatTime, formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { updateTeleconsulta } from "@/services/api";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/vet/teleconsultas/$id/")({
  head: ({ loaderData }) => ({ meta: [{ title: `Teleconsulta · ${loaderData?.tc?.id ?? ""}` }] }),
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
  component: TeleInfo,
  notFoundComponent: () => <p>Teleconsulta não encontrada.</p>,
});

function TeleInfo() {
  const router = useRouter();
  const { tc, pet, tutor } = Route.useLoaderData();
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    setIsSubmitting(true);
    try {
      await updateTeleconsulta((tc.id || (tc as any)._id) as string, { data: new Date(newDate).toISOString() });
      toast.success("Teleconsulta remarcada com sucesso");
      setIsRescheduleOpen(false);
      router.invalidate();
    } catch (error) {
      toast.error("Erro ao remarcar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Link to="/vet/teleconsultas" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" />Voltar para teleconsultas</Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10" style={{ background: "var(--gradient-hero)" }} />
            <div className="relative flex justify-between items-start flex-wrap gap-4">
              <div className="flex gap-4 items-center">
                <div className="h-20 w-20 rounded-md bg-brand-deep/15 grid place-items-center text-5xl">{pet.foto}</div>
                <div>
                  <h1 className="font-display text-3xl">{pet.nome}</h1>
                  <p className="text-muted-foreground">{pet.raca} · {pet.idade} anos · {pet.peso} kg</p>
                  <div className="flex gap-2 mt-2"><Badge variant="secondary">{pet.especie}</Badge><Badge variant="outline">{pet.sexo === "M" ? "Macho" : "Fêmea"}</Badge>{pet.diagnosticoAtual && <Badge>{pet.diagnosticoAtual}</Badge>}</div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Agendada para</p>
                <p className="font-display text-xl flex items-center gap-1 justify-end"><Clock className="h-5 w-5 text-brand-deep" />{formatDate(tc.data)} às {formatTime(tc.data)}</p>
                <p className="text-xs text-muted-foreground mt-1">{tc.duracaoMin} minutos</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg flex items-center gap-2 mb-3"><AlertCircle className="h-4 w-4 text-brand-deep" />Queixas relatadas pelo tutor</h2>
            <p className="text-sm">{tc.queixas}</p>
            {tc.sintomasRelatados && (
              <>
                <h3 className="text-sm font-medium mt-4 mb-2">Sintomas observados</h3>
                <p className="text-sm text-muted-foreground">{tc.sintomasRelatados}</p>
              </>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-lg flex items-center gap-2 mb-3"><FlaskConical className="h-4 w-4 text-brand-deep" />Histórico relevante de {pet.nome}</h2>
            <ul className="space-y-2 text-sm">
              {(pet.historico || []).map(h => (
                <li key={h.id} className="flex justify-between border-b border-border pb-2 last:border-0">
                  <span>{h.motivo} <span className="text-muted-foreground">— {h.diagnostico ?? "—"}</span></span>
                  <span className="text-xs text-muted-foreground">{formatDate(h.data)}</span>
                </li>
              ))}
              {(!pet.historico || pet.historico.length === 0) && <p className="text-muted-foreground">Sem histórico clínico.</p>}
            </ul>
            {(pet.exames && pet.exames.length > 0) && (
              <>
                <h3 className="text-sm font-medium mt-5 mb-2">Exames recentes</h3>
                <ul className="text-sm space-y-1">
                  {pet.exames.map(e => <li key={e.id} className="flex justify-between"><span>{e.nome}</span><span className="text-muted-foreground text-xs">{formatDate(e.data)}</span></li>)}
                </ul>
              </>
            )}
          </Card>


        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <p className="text-xs text-muted-foreground">Tutor</p>
            <p className="font-display text-lg">{tutor.nome}</p>
            <p className="text-xs text-muted-foreground">{tutor.telefone}</p>
            <p className="text-xs text-muted-foreground">{tutor.email}</p>
            <Link to="/vet/tutores/$tutorId" params={{ tutorId: (tutor.id || (tutor as any)._id) as string }}>
              <Button variant="outline" className="w-full mt-4" size="sm">Ver perfil completo</Button>
            </Link>
          </Card>

          <Link to="/vet/teleconsultas/$id/live" params={{ id: (tc.id || (tc as any)._id) as string }}>
            <Button className="w-full rounded-md" size="lg"><Video className="h-4 w-4 mr-2" />Iniciar teleconsulta</Button>
          </Link>
          <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">Remarcar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remarcar Teleconsulta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleReschedule} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nova Data e Hora</Label>
                  <Input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsRescheduleOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting}>Confirmar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
