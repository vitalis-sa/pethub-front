import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, FlaskConical, Pill, Syringe, Info } from "lucide-react";
import { getPet } from "@/services/api";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/tutor/pets/$petId")({
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.pet?.nome ?? "Pet"} — PetHub` }] }),
  loader: async ({ params }) => {
    try {
      const pet = await getPet(params.petId);
      return { pet };
    } catch {
      throw notFound();
    }
  },
  component: TutorPetDetail,
  notFoundComponent: () => <p>Pet não encontrado.</p>,
});

function TutorPetDetail() {
  const { pet } = Route.useLoaderData();

  return (
    <>
      <Link to="/tutor" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" />Voltar</Link>

      <Card className="p-6 mb-6 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative flex gap-6 items-start flex-wrap">
          <div className="h-28 w-28 rounded-md bg-brand-deep/15 grid place-items-center text-7xl">{pet.foto}</div>
          <div className="flex-1 min-w-[240px]">
            <h1 className="font-display text-4xl">{pet.nome}</h1>
            <p className="text-muted-foreground">{pet.raca} · {pet.cor}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant="secondary">{pet.especie}</Badge>
              <Badge variant="outline">{pet.sexo === "M" ? "Macho" : "Fêmea"}</Badge>
              <Badge variant="outline">{pet.idade} anos</Badge>
              <Badge variant="outline">{pet.peso} kg</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-6 bg-secondary/40 border-accent/40 flex gap-3 items-start">
        <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm">Só o veterinário pode adicionar consultas, exames, vacinas ou tratamentos. Você consulta o histórico completo aqui.</p>
      </Card>

      <Tabs defaultValue="historico">
        <TabsList>
          <TabsTrigger value="historico"><Calendar className="h-4 w-4 mr-1" />Histórico</TabsTrigger>
          <TabsTrigger value="tratamentos"><Pill className="h-4 w-4 mr-1" />Tratamentos</TabsTrigger>
          <TabsTrigger value="exames"><FlaskConical className="h-4 w-4 mr-1" />Exames</TabsTrigger>
          <TabsTrigger value="vacinas"><Syringe className="h-4 w-4 mr-1" />Vacinas</TabsTrigger>
        </TabsList>
        <TabsContent value="historico" className="mt-4">
          <SectionList title="Histórico de consultas" items={(pet.historico || []).map(h => ({
            title: h.motivo, sub: `${formatDate(h.data)} · ${h.vet}`, extra: h.diagnostico,
          }))} />
        </TabsContent>
        <TabsContent value="tratamentos" className="mt-4">
          <SectionList title="Tratamentos em curso" items={(pet.tratamentos || []).map(t => ({
            title: t.nome, sub: `Início: ${formatDate(t.inicio)}${t.fim ? ` · Fim: ${formatDate(t.fim)}` : ""}`, extra: t.obs,
          }))} />
        </TabsContent>
        <TabsContent value="exames" className="mt-4">
          <SectionList title="Exames realizados" items={(pet.exames || []).map(e => ({
            title: e.nome, sub: formatDate(e.data), extra: e.resultado,
          }))} />
        </TabsContent>
        <TabsContent value="vacinas" className="mt-4">
          <SectionList title="Vacinas" items={(pet.vacinas || []).map(v => ({ title: v.nome, sub: formatDate(v.data) }))} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function SectionList({ title, items }: { title: string; items: { title: string; sub: string; extra?: string }[] }) {
  if (items.length === 0) return <Card className="p-8 text-center text-muted-foreground">Nenhum registro de {title.toLowerCase()}.</Card>;
  return (
    <Card className="divide-y divide-border">
      <div className="p-4 font-semibold text-sm bg-muted/50">{title}</div>
      {items.map((it, i) => (
        <div key={i} className="p-4 flex justify-between gap-3 flex-wrap">
          <div><p className="font-medium">{it.title}</p><p className="text-xs text-muted-foreground">{it.sub}</p></div>
          {it.extra && <p className="text-sm text-muted-foreground max-w-md text-right">{it.extra}</p>}
        </div>
      ))}
    </Card>
  );
}
