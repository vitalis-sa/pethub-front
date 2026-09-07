import { createFileRoute, Link, useNavigate, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Calendar, FlaskConical, Pill, Syringe, Stethoscope, Pencil, Check, X, Sparkles, Trash2, Loader2 } from "lucide-react";
import { AIChatMock } from "@/components/AIChatMock";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getPet, getTutor, updatePet, deletePet, uploadExameResult } from "@/services/api";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/vet/pets/$petId")({
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.pet?.nome ?? "Pet"} — PetHub Vet` }] }),
  loader: async ({ params }) => {
    try {
      const pet = await getPet(params.petId);
      const tutor = await getTutor(pet.tutorId);
      return { pet, tutor };
    } catch {
      throw notFound();
    }
  },
  component: PetDetail,
  notFoundComponent: () => <p>Pet não encontrado.</p>,
});

function PetDetail() {
  const navigate = useNavigate();
  const router = useRouter();
  const { pet, tutor } = Route.useLoaderData();
  const petId = (pet.id || (pet as any)._id) as string;

  const [editing, setEditing] = useState(false);
  const [diag, setDiag] = useState(pet.diagnosticoAtual || "");
  const isSaudavel = /saud/i.test(pet.diagnosticoAtual || "");
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modals state
  const [isAddTratamentoOpen, setIsAddTratamentoOpen] = useState(false);
  const [isAddExameOpen, setIsAddExameOpen] = useState(false);
  const [isAddVacinaOpen, setIsAddVacinaOpen] = useState(false);
  const [isAddHistoricoOpen, setIsAddHistoricoOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isUploadingExam, setIsUploadingExam] = useState<string | null>(null);
  const [selectedExameResult, setSelectedExameResult] = useState<string | null>(null);

  const saveDiag = async () => {
    try {
      const novoDiag = diag?.trim() || "Saudável";
      await updatePet(petId, { diagnosticoAtual: novoDiag });
      pet.diagnosticoAtual = novoDiag; // optimistically update local
      setEditing(false);
      toast.success("Diagnóstico atualizado");
    } catch (error: any) {
      toast.error("Erro ao atualizar diagnóstico: " + error.message);
    }
  };

  const handleDeletePet = async () => {
    setIsDeleting(true);
    try {
      await deletePet(petId);
      toast.success("Pet excluído com sucesso");
      navigate({ to: "/vet/pets" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const updatePetArray = async (field: string, newObj: any, setModalOpen: (v: boolean) => void) => {
    try {
      const arr = [...(pet[field as keyof typeof pet] || []), { id: Date.now().toString(), ...newObj }];
      await updatePet(petId, { [field]: arr });
      setModalOpen(false);
      setFormData({});
      toast.success("Adicionado com sucesso!");
      router.invalidate();
    } catch (err: any) {
      toast.error("Erro ao adicionar: " + err.message);
    }
  };

  const handleUploadExam = async (exameId: string, file: File) => {
    setIsUploadingExam(exameId);
    try {
      const resultText = await uploadExameResult(petId, exameId, file);
      // Update the exam in pet's array
      const updatedExames = (pet.exames || []).map(e => e.id === exameId ? { ...e, resultado: resultText } : e);
      await updatePet(petId, { ...pet, exames: updatedExames });
      toast.success("Resultado processado pela IA e salvo com sucesso!");
      router.invalidate();
    } catch (error: any) {
      toast.error("Falha ao enviar arquivo: " + error.message);
    } finally {
      setIsUploadingExam(null);
    }
  };

  const clearExameResult = async (exameId: string) => {
    try {
      const updatedExames = (pet.exames || []).map(e => e.id === exameId ? { ...e, resultado: null } : e);
      await updatePet(petId, { ...pet, exames: updatedExames });
      toast.success("Laudo removido. Você pode enviar o arquivo novamente.");
      router.invalidate();
    } catch (error: any) {
      toast.error("Erro ao remover laudo: " + error.message);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Link to="/vet/pets" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4 mr-1" />Voltar para pets</Link>
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Deletar Pet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Pet</DialogTitle>
            </DialogHeader>
            <div className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja excluir o prontuário de <strong>{pet.nome}</strong>? Esta ação apagará todo o histórico, vacinas e exames associados, e não poderá ser desfeita.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDeletePet} disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirmar Exclusão
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
          <Link to="/vet/tutores/$tutorId" params={{ tutorId: (tutor.id || (tutor as any)._id) as string }}>
            <Card className="p-4 bg-card/80 backdrop-blur w-64 hover:border-primary/50 transition-colors">
              <p className="text-xs text-muted-foreground">Tutor responsável</p>
              <p className="font-medium mt-1">{tutor.nome}</p>
              <p className="text-xs text-muted-foreground">{tutor.telefone}</p>
            </Card>
          </Link>
        </div>
      </Card>

      <Card className="p-5 mb-6 border-l-4" style={{ borderLeftColor: isSaudavel ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary/10 grid place-items-center"><Stethoscope className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Diagnóstico atual</p>
              {editing ? (
                <Input value={diag} onChange={e => setDiag(e.target.value)} className="mt-1 max-w-md" placeholder="Ex.: Saudável, Dermatite alérgica..." />
              ) : (
                <p className="font-display text-xl">{pet.diagnosticoAtual}</p>
              )}
            </div>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={saveDiag}><Check className="h-4 w-4 mr-1" />Salvar</Button>
              <Button size="sm" variant="outline" onClick={() => { setDiag(pet.diagnosticoAtual); setEditing(false); }}><X className="h-4 w-4" /></Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="h-4 w-4 mr-1" />Editar diagnóstico</Button>
          )}
        </div>
      </Card>

      <Tabs defaultValue="tratamentos">
        <TabsList>
          <TabsTrigger value="tratamentos"><Pill className="h-4 w-4 mr-1" />Tratamentos</TabsTrigger>
          <TabsTrigger value="exames"><FlaskConical className="h-4 w-4 mr-1" />Exames</TabsTrigger>
          <TabsTrigger value="vacinas"><Syringe className="h-4 w-4 mr-1" />Vacinas</TabsTrigger>
          <TabsTrigger value="historico"><Calendar className="h-4 w-4 mr-1" />Histórico</TabsTrigger>
          <TabsTrigger value="ia"><Sparkles className="h-4 w-4 mr-1" />Chat IA</TabsTrigger>
        </TabsList>

        <TabsContent value="tratamentos" className="mt-4">
          <SectionList title="Tratamentos em curso" addLabel="Adicionar tratamento" onAddClick={() => { setFormData({}); setIsAddTratamentoOpen(true); }} items={(pet.tratamentos || []).map(t => ({
            title: t.nome, sub: `Início: ${formatDate(t.inicio)}${t.fim ? ` · Fim: ${formatDate(t.fim)}` : ""}`, extra: t.obs,
          }))} />
        </TabsContent>
        <TabsContent value="exames" className="mt-4">
          <SectionList title="Exames realizados" addLabel="Adicionar exame" onAddClick={() => { setFormData({}); setIsAddExameOpen(true); }} items={(pet.exames || []).map(e => ({
            title: e.nome, 
            sub: formatDate(e.data), 
            extra: e.resultado ? "Laudo extraído pela IA" : "Aguardando resultado...",
            action: !e.resultado ? (
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*,application/pdf" className="max-w-md border-0 shadow-none bg-transparent p-0 h-auto file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer text-muted-foreground" onChange={(evt) => {
                  if (evt.target.files?.[0]) handleUploadExam(e.id, evt.target.files[0]);
                }} disabled={isUploadingExam === e.id} />
                {isUploadingExam === e.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {isUploadingExam === e.id && <span className="text-xs text-muted-foreground">Lendo e extraindo...</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedExameResult(e.resultado!)}>
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  Ver Laudo da IA
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => clearExameResult(e.id!)} title="Apagar laudo e re-enviar">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          }))} />
        </TabsContent>
        <TabsContent value="vacinas" className="mt-4">
          <SectionList title="Vacinas" addLabel="Registrar vacina" onAddClick={() => { setFormData({}); setIsAddVacinaOpen(true); }} items={(pet.vacinas || []).map(v => ({ title: v.nome, sub: formatDate(v.data) }))} />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <SectionList title="Histórico clínico" addLabel="Novo registro" onAddClick={() => { setFormData({}); setIsAddHistoricoOpen(true); }} items={(pet.historico || []).map(h => ({
            title: h.motivo, sub: `${formatDate(h.data)} · ${h.vet}`, extra: h.diagnostico,
          }))} />
        </TabsContent>
        <TabsContent value="ia" className="mt-4">
          <AIChatMock context={`pet-${petId}`} petId={petId} petName={pet.nome} title={`Discutir diagnóstico de ${pet.nome} com IA`} />
        </TabsContent>
      </Tabs>

      <Dialog open={isAddTratamentoOpen} onOpenChange={setIsAddTratamentoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Tratamento</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); updatePetArray("tratamentos", formData, setIsAddTratamentoOpen); }} className="space-y-3 pt-3">
            <div className="space-y-1"><Label>Nome</Label><Input required value={formData.nome || ""} onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
            <div className="space-y-1"><Label>Data de Início</Label><Input type="date" required value={formData.inicio || ""} onChange={e => setFormData({...formData, inicio: e.target.value})} /></div>
            <div className="space-y-1"><Label>Data de Fim (opcional)</Label><Input type="date" value={formData.fim || ""} onChange={e => setFormData({...formData, fim: e.target.value})} /></div>
            <div className="space-y-1"><Label>Observações</Label><Textarea value={formData.obs || ""} onChange={e => setFormData({...formData, obs: e.target.value})} /></div>
            <Button type="submit" className="w-full mt-4">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddExameOpen} onOpenChange={setIsAddExameOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Exame</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); updatePetArray("exames", formData, setIsAddExameOpen); }} className="space-y-3 pt-3">
            <div className="space-y-1"><Label>Nome do exame</Label><Input required value={formData.nome || ""} onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
            <div className="space-y-1"><Label>Data</Label><Input type="date" required value={formData.data || ""} onChange={e => setFormData({...formData, data: e.target.value})} /></div>
            <div className="space-y-1"><Label>Resultado</Label><Textarea value={formData.resultado || ""} onChange={e => setFormData({...formData, resultado: e.target.value})} /></div>
            <Button type="submit" className="w-full mt-4">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddVacinaOpen} onOpenChange={setIsAddVacinaOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Vacina</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); updatePetArray("vacinas", formData, setIsAddVacinaOpen); }} className="space-y-3 pt-3">
            <div className="space-y-1"><Label>Nome da vacina</Label><Input required value={formData.nome || ""} onChange={e => setFormData({...formData, nome: e.target.value})} /></div>
            <div className="space-y-1"><Label>Data</Label><Input type="date" required value={formData.data || ""} onChange={e => setFormData({...formData, data: e.target.value})} /></div>
            <Button type="submit" className="w-full mt-4">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddHistoricoOpen} onOpenChange={setIsAddHistoricoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar Histórico Clínico</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); updatePetArray("historico", { ...formData, vet: "Dr(a) logado" }, setIsAddHistoricoOpen); }} className="space-y-3 pt-3">
            <div className="space-y-1"><Label>Motivo da consulta</Label><Input required value={formData.motivo || ""} onChange={e => setFormData({...formData, motivo: e.target.value})} /></div>
            <div className="space-y-1"><Label>Data</Label><Input type="date" required value={formData.data || ""} onChange={e => setFormData({...formData, data: e.target.value})} /></div>
            <div className="space-y-1"><Label>Diagnóstico / Desfecho</Label><Textarea value={formData.diagnostico || ""} onChange={e => setFormData({...formData, diagnostico: e.target.value})} /></div>
            <Button type="submit" className="w-full mt-4">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedExameResult} onOpenChange={(open) => !open && setSelectedExameResult(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Parecer da IA sobre o Exame</DialogTitle>
          </DialogHeader>
          <div className="pt-4 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{selectedExameResult || ""}</ReactMarkdown>
          </div>
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button onClick={() => setSelectedExameResult(null)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SectionList({ title, addLabel, items, onAddClick }: { title: string; addLabel?: string; items: { title: string; sub: string; extra?: string; action?: React.ReactNode }[]; onAddClick?: () => void }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl">{title}</h3>
        {addLabel && onAddClick && <Button size="sm" onClick={onAddClick}><Plus className="h-4 w-4 mr-1" />{addLabel}</Button>}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum registro ainda.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it, i) => (
            <li key={i} className="p-4 rounded-lg border border-border flex flex-col gap-2">
              <div className="flex justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium">{it.title}</p>
                  <p className="text-xs text-muted-foreground">{it.sub}</p>
                </div>
                {it.extra && <p className="text-sm text-muted-foreground max-w-md text-right">{it.extra}</p>}
              </div>
              {it.action && (
                <div className="mt-2 pt-3 border-t border-border">
                  {it.action}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
