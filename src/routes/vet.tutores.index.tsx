import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createTutor, getTutores, getPets } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/vet/tutores/")({
  head: () => ({ meta: [{ title: "Tutores — PetHub Vet" }] }),
  loader: async () => {
    const [tutoresData, petsData] = await Promise.all([getTutores(), getPets()]);
    return { tutoresData, petsData };
  },
  component: TutoresList,
});

function TutoresList() {
  const { tutoresData, petsData } = Route.useLoaderData();
  const router = useRouter();

  const [q, setQ] = useState("");
  const [sexo, setSexo] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = useMemo(() => tutoresData.filter(t => {
    if (q && !(t.nome + t.cpf + t.email).toLowerCase().includes(q.toLowerCase())) return false;
    if (sexo !== "todos" && t.sexo !== sexo) return false;
    return true;
  }), [tutoresData, q, sexo]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get("nome") as string,
      cpf: formData.get("cpf") as string,
      email: formData.get("email") as string,
      telefone: formData.get("telefone") as string,
      sexo: formData.get("sexo") as "M" | "F",
      data_nascimento: formData.get("data_nascimento") as string,
      endereco: formData.get("endereco") as string,
      password: formData.get("password") as string,
      petIds: []
    };

    setIsLoading(true);
    try {
      await createTutor(data as any);
      toast.success("Tutor cadastrado com sucesso!");
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
      <PageHeader title="Tutores" subtitle={`${tutoresData.length} tutores cadastrados`} actions={
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-md"><Plus className="h-4 w-4 mr-1" />Cadastrar tutor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Tutor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" name="nome" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" name="cpf" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" name="telefone" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                  <select id="sexo" name="sexo" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input id="data_nascimento" name="data_nascimento" type="date" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input id="endereco" name="endereco" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha de Acesso</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar Tutor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      } />

      <Card className="p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Buscar por nome, CPF ou e-mail..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sexo:</span>
            <select value={sexo} onChange={e => setSexo(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
              <option value="todos">Todos</option><option value="F">F</option><option value="M">M</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="divide-y divide-border">
          {filtered.map(t => {
            const pets = petsData.filter(p => p.tutorId === (t.id || (t as any)._id));
            return (
              <Link key={t.id || (t as any)._id} to="/vet/tutores/$tutorId" params={{ tutorId: (t.id || (t as any)._id) as string }} className="block p-4 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-brand-deep/15 grid place-items-center font-display text-lg">{t.nome[0]}</div>
                  <div className="flex-1">
                    <p className="font-medium">{t.nome}</p>
                    <p className="text-xs text-muted-foreground">CPF {t.cpf} · {t.sexo === "F" ? "Feminino" : "Masculino"}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {pets.map(p => <Badge key={p.id || (p as any)._id} variant="secondary">{p.foto} {p.nome}</Badge>)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </>
  );
}