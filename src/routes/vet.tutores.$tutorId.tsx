import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { getTutor, getPets } from "@/services/api";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/vet/tutores/$tutorId")({
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.tutor?.nome ?? "Tutor"} — PetHub Vet` }] }),
  loader: async ({ params }) => {
    try {
      const t = await getTutor(params.tutorId);
      const allPets = await getPets();
      const pets = allPets.filter(p => p.tutorId === (t.id || (t as any)._id));
      return { tutor: t, pets };
    } catch {
      throw notFound();
    }
  },
  component: TutorDetail,
  notFoundComponent: () => <p>Tutor não encontrado.</p>,
});

function TutorDetail() {
  const { tutor: t, pets } = Route.useLoaderData();

  return (
    <>
      <Link to="/vet/tutores" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="h-4 w-4 mr-1" />Voltar para tutores</Link>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-1">
          <div className="h-20 w-20 rounded-md bg-brand-deep/15 grid place-items-center font-display text-3xl">{t.nome[0]}</div>
          <h1 className="font-display text-2xl mt-4">{t.nome}</h1>
          <p className="text-sm text-muted-foreground">{t.sexo === "F" ? "Feminino" : "Masculino"} · {t.idade} anos · CPF {t.cpf}</p>
          <div className="mt-5 space-y-2 text-sm">
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{t.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{t.telefone}</p>
            <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />{t.endereco}</p>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-xl mb-4">Pets atrelados ({pets.length})</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {pets.map(p => (
                <Link key={p.id} to="/vet/pets/$petId" params={{ petId: p.id }} className="block">
                  <div className="p-4 rounded-md border border-border hover:border-primary/50 transition-colors flex gap-3 items-center">
                    <div className="h-12 w-12 rounded-md bg-brand-deep/15 grid place-items-center text-2xl">{p.foto}</div>
                    <div>
                      <p className="font-medium">{p.nome}</p>
                      <p className="text-xs text-muted-foreground">{p.raca} · {p.idade}a</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-xl mb-4 flex items-center gap-2"><Calendar className="h-5 w-5" />Histórico de visitas</h2>
            {(!t.historicoVisitas || t.historicoVisitas.length === 0) ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sem visitas registradas.</p>
            ) : (
              <ul className="space-y-3">
                {t.historicoVisitas.map((v, i) => (
                  <li key={i} className="p-4 rounded-lg border border-border flex justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-sm">{v.motivo}</p>
                      <p className="text-xs text-muted-foreground">{v.vet}</p>
                    </div>
                    <Badge variant="outline">{formatDate(v.data)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
