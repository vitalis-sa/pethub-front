import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { deleteVet, getVets } from "@/services/api";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/vet/perfil")({
  head: () => ({ meta: [{ title: "Perfil — PetHub Vet" }] }),
  loader: async () => {
    const vets = await getVets();
    return { currentVet: vets[0] || null };
  },
  component: Perfil,
});

function Perfil() {
  const navigate = useNavigate();
  const { currentVet } = Route.useLoaderData();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) return toast.error("A senha é obrigatória para excluir a conta");
    
    setIsDeleting(true);
    try {
      // Idealmente a API validaria a senha no DELETE, 
      // ou enviaríamos num POST para verificar antes
      await deleteVet(currentVet.id);
      toast.success("Conta excluída com sucesso");
      navigate({ to: "/login" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageHeader title="Meu perfil" subtitle="Suas informações profissionais" />
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="h-28 w-28 rounded-md bg-brand-deep/15 grid place-items-center text-6xl mx-auto">{currentVet.foto}</div>
          <h2 className="font-display text-2xl mt-4">{currentVet.nome}</h2>
          <p className="text-sm text-muted-foreground">{currentVet.especialidade}</p>
          <p className="text-xs text-muted-foreground mt-2">{currentVet.crmv}</p>
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
            <div className="space-y-2"><Label>Nome completo</Label><Input defaultValue={currentVet.nome} /></div>
            <div className="space-y-2"><Label>CRMV</Label><Input defaultValue={currentVet.crmv} /></div>
            <div className="space-y-2"><Label>E-mail</Label><Input type="email" defaultValue={currentVet.email} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input defaultValue="(11) 99988-7766" /></div>
          </div>
          <div className="space-y-2"><Label>Especialidade</Label><Input defaultValue={currentVet.especialidade} /></div>
          <div className="space-y-2"><Label>Bio</Label><Textarea className="min-h-[100px]" defaultValue="Veterinária com 12 anos de experiência em clínica geral, com foco em dermatologia." /></div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border"><Button variant="outline">Cancelar</Button><Button>Salvar alterações</Button></div>
        </Card>
      </div>
    </>
  );
}
