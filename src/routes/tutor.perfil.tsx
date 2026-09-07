import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { deleteTutor, getTutores, getPets } from "@/services/api";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/tutor/perfil")({
  head: () => ({ meta: [{ title: "Meu perfil — PetHub" }] }),
  loader: async () => {
    const tutores = await getTutores();
    const currentTutor = tutores[0] || null; // fallback para simular auth
    const allPets = await getPets();
    const pets = currentTutor ? allPets.filter(p => p.tutorId === (currentTutor.id || (currentTutor as any)._id)) : [];
    return { currentTutor, pets };
  },
  component: Perfil,
});

function Perfil() {
  const navigate = useNavigate();
  const { currentTutor, pets } = Route.useLoaderData();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) return toast.error("A senha é obrigatória para excluir a conta");
    
    setIsDeleting(true);
    try {
      await deleteTutor(currentTutor.id);
      toast.success("Conta de tutor excluída com sucesso");
      navigate({ to: "/login" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentTutor) {
    return <div className="p-10 text-center text-muted-foreground">Nenhum tutor encontrado. Cadastre um tutor primeiro.</div>;
  }

  return (
    <>
      <PageHeader title="Meu perfil" subtitle="Seus dados e seus pets" />
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="h-28 w-28 rounded-md bg-brand-deep/15 grid place-items-center font-display text-5xl mx-auto">{currentTutor.nome?.[0] || 'T'}</div>
          <h2 className="font-display text-2xl mt-4">{currentTutor.nome}</h2>
          <p className="text-sm text-muted-foreground">{currentTutor.email}</p>
          <Button variant="outline" className="mt-4 w-full">Trocar foto</Button>

          <div className="mt-8 pt-6 border-t border-border">
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Deletar Conta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir Conta</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleDelete} className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Esta ação é irreversível. Para confirmar a exclusão da sua conta, digite sua senha abaixo.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="delete-password">Senha</Label>
                    <Input 
                      id="delete-password" 
                      type="password" 
                      value={deletePassword} 
                      onChange={e => setDeletePassword(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" variant="destructive" disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Confirmar Exclusão
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
        <Card className="p-6 md:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nome</Label><Input defaultValue={currentTutor.nome} /></div>
            <div className="space-y-2"><Label>CPF</Label><Input defaultValue={currentTutor.cpf} /></div>
            <div className="space-y-2"><Label>Sexo</Label><Input defaultValue={currentTutor.sexo === "F" ? "Feminino" : "Masculino"} /></div>
            <div className="space-y-2"><Label>Data de Nascimento</Label><Input type="date" defaultValue={currentTutor.data_nascimento || ""} /></div>
            <div className="space-y-2"><Label>E-mail</Label><Input defaultValue={currentTutor.email} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input defaultValue={currentTutor.telefone} /></div>
          </div>
          <div className="space-y-2"><Label>Endereço</Label><Input defaultValue={currentTutor.endereco} /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border"><Button variant="outline">Cancelar</Button><Button>Salvar</Button></div>
        </Card>
        <Card className="p-6 md:col-span-3">
          <h2 className="font-display text-xl mb-4">Meus pets</h2>
          <div className="flex gap-2 flex-wrap">
            {pets.map(p => <Badge key={p.id} variant="secondary" className="text-base py-1.5 px-3">{p.foto} {p.nome}</Badge>)}
          </div>
        </Card>
      </div>
    </>
  );
}
