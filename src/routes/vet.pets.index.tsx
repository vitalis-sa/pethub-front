import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createPet, getPets, getTutores } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/vet/pets/")({
  head: () => ({ meta: [{ title: "Pets — PetHub Vet" }] }),
  loader: async () => {
    const [petsData, tutoresData] = await Promise.all([
      getPets(),
      getTutores(),
    ]);
    return { petsData, tutoresData };
  },
  component: PetsList,
});

function PetsList() {
  const { petsData, tutoresData } = Route.useLoaderData();
  const router = useRouter();

  const [q, setQ] = useState("");
  const [especie, setEspecie] = useState<string>("todas");
  const [sexo, setSexo] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getTutorInfo = (id: string) => tutoresData.find(t => t.id === id || (t as any)._id === id);

  const filtered = useMemo(() => petsData.filter(p => {
    const tutor = getTutorInfo(p.tutorId);
    const text = (p.nome + p.raca + (tutor?.nome ?? "")).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (especie !== "todas" && p.especie !== especie) return false;
    if (sexo !== "todos" && p.sexo !== sexo) return false;
    return true;
  }), [petsData, tutoresData, q, especie, sexo]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      tutorId: formData.get("tutorId") as string,
      nome: formData.get("nome") as string,
      especie: formData.get("especie") as string,
      raca: formData.get("raca") as string,
      cor: formData.get("cor") as string,
      sexo: formData.get("sexo") as "M" | "F",
      peso: Number(formData.get("peso")),
      idade: Number(formData.get("idade")),
      foto: "🐾",
      historico: [],
      vacinas: [],
      exames: [],
      tratamentos: [],
      diagnosticoAtual: "Saudável"
    };

    setIsLoading(true);
    try {
      await createPet(data as any);
      toast.success("Pet cadastrado com sucesso!");
      setIsModalOpen(false);
      router.invalidate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Pets" subtitle={`${petsData.length} pacientes cadastrados`} actions={
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-md"><Plus className="h-4 w-4 mr-1" />Cadastrar pet</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Pet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="tutorId">Tutor Responsável</Label>
                <select id="tutorId" name="tutorId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Selecione um tutor...</option>
                  {tutoresData.map(t => (
                    <option key={t.id || (t as any)._id} value={t.id || (t as any)._id}>{t.nome} (CPF: {t.cpf})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Pet</Label>
                <Input id="nome" name="nome" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="especie">Espécie</Label>
                  <select id="especie" name="especie" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Cão">Cão</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Coelho">Coelho</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="raca">Raça</Label>
                  <Input id="raca" name="raca" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor/Pelagem</Label>
                  <Input id="cor" name="cor" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                  <select id="sexo" name="sexo" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="M">Macho</option>
                    <option value="F">Fêmea</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idade">Idade (anos)</Label>
                  <Input id="idade" name="idade" type="number" step="0.1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input id="peso" name="peso" type="number" step="0.1" required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar Pet
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      } />

      <Card className="p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Buscar por nome, raça ou tutor..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <FilterPill label="Espécie" value={especie} onChange={setEspecie} options={["todas","Cão","Gato","Coelho","Ave"]} />
          <FilterPill label="Sexo" value={sexo} onChange={setSexo} options={["todos","M","F"]} />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => {
          const tutor = getTutorInfo(p.tutorId);
          return (
            <Link key={p.id || (p as any)._id} to="/vet/pets/$petId" params={{ petId: (p.id || (p as any)._id) as string }} className="block">
              <Card className="p-5 hover:border-primary/50 hover:shadow-[var(--shadow-soft)] transition-all cursor-pointer h-full">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-md bg-brand-deep/15 grid place-items-center text-4xl shrink-0">{p.foto}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xl truncate">{p.nome}</p>
                    <p className="text-sm text-muted-foreground truncate">{p.raca}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Badge variant="secondary">{p.especie}</Badge>
                      <Badge variant="outline">{p.sexo === "M" ? "Macho" : "Fêmea"}</Badge>
                      <Badge variant="outline">{p.idade}a</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  Tutor: <span className="text-foreground font-medium">{tutor?.nome}</span>
                </div>
              </Card>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground md:col-span-2 lg:col-span-3"><Filter className="h-6 w-6 mx-auto mb-2" />Nenhum pet encontrado.</Card>
        )}
      </div>
    </>
  );
}

function FilterPill({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
        {options.map(o => <option key={o} value={o}>{o === "todas" || o === "todos" ? "Todos" : o}</option>)}
      </select>
    </div>
  );
}