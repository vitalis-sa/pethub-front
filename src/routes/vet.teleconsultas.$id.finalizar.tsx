import { createFileRoute, Link, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Plus, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { getTeleconsulta, getPet, updateTeleconsulta, updatePet } from "@/services/api";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/vet/teleconsultas/$id/finalizar")({
  head: () => ({ meta: [{ title: "Finalizar teleconsulta" }] }),
  loader: async ({ params }) => {
    try {
      const tc = await getTeleconsulta(params.id);
      const pet = await getPet(tc.petId);
      return { tc, pet };
    } catch {
      throw notFound();
    }
  },
  component: Finalizar,
  notFoundComponent: () => <p>Não encontrada.</p>,
});

function Finalizar() {
  const { tc, pet } = Route.useLoaderData();
  const id = tc.id || (tc as any)._id as string;
  const navigate = useNavigate();
  const router = useRouter();

  const [diagnostico, setDiagnostico] = useState(tc.diagnostico ?? "");
  const [observacoes, setObservacoes] = useState(tc.observacoes ?? "");
  const [tratamentos, setTratamentos] = useState<{nome: string, detalhes: string}[]>(tc.tratamento ? [{ nome: "Prescrição Geral", detalhes: tc.tratamento }] : []);
  const [activeTratamentoTab, setActiveTratamentoTab] = useState<string>("0");
  const [exames, setExames] = useState<{nome: string, pedidoMedico: string}[]>(tc.exames && tc.exames.length > 0 ? tc.exames.map((e: any) => typeof e === 'string' ? { nome: e, pedidoMedico: "" } : e) : []);
  const [activeTab, setActiveTab] = useState<string>("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [laudoIA, setLaudoIA] = useState<string>(tc.analiseGenAI || "");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`laudo-${id}`);
      if (saved) setLaudoIA(saved);
    }
  }, [id]);

  const addTratamento = () => {
    const newIdx = tratamentos.length;
    setTratamentos([...tratamentos, { nome: "Novo Tratamento", detalhes: "" }]);
    setActiveTratamentoTab(newIdx.toString());
  };

  const updateTratamento = (index: number, field: 'nome' | 'detalhes', value: string) => {
    const novos = [...tratamentos];
    novos[index][field] = value;
    setTratamentos(novos);
  };

  const removeTratamento = (index: number) => {
    const novos = tratamentos.filter((_, i) => i !== index);
    setTratamentos(novos);
    if (activeTratamentoTab === index.toString()) {
      setActiveTratamentoTab(novos.length > 0 ? "0" : "");
    }
  };

  const addExame = () => {
    const newIdx = exames.length;
    setExames([...exames, { nome: "Novo Exame", pedidoMedico: "" }]);
    setActiveTab(newIdx.toString());
  };

  const updateExame = (index: number, field: 'nome' | 'pedidoMedico', value: string) => {
    const novos = [...exames];
    novos[index][field] = value;
    setExames(novos);
  };

  const removeExame = (index: number) => {
    const novos = exames.filter((_, i) => i !== index);
    setExames(novos);
    if (activeTab === index.toString()) {
      setActiveTab(novos.length > 0 ? "0" : "");
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateTeleconsulta(id, {
        ...tc,
        status: "concluida",
        diagnostico,
        tratamentoPrescrito: tratamentos.map(t => `${t.nome}: ${t.detalhes}`).join('\n\n'),
        examesSolicitados: exames.map(e => `${e.nome}${e.pedidoMedico ? ` (${e.pedidoMedico})` : ''}`),
      });

      // Sync with Pet profile
      const petId = (pet.id || (pet as any)._id) as string;
      const novosTratamentos = tratamentos.filter(t => t.nome.trim() !== "").map((t, idx) => ({ 
        id: Date.now().toString() + "1" + idx, 
        nome_procedimento: t.nome, 
        obs: t.detalhes, 
        inicio: new Date().toISOString() 
      }));
      
      const novosExames = exames.filter(e => e.nome.trim() !== "").map((e, idx) => ({ 
        id: Date.now().toString() + idx, 
        nome: e.nome, 
        pedidoMedico: e.pedidoMedico, 
        data: new Date().toISOString(), 
        resultado: "" 
      }));

      const novoHistorico = { 
        id: Date.now().toString(), 
        data: new Date().toISOString(), 
        consultaId: id,
        perdaApetite: false, vomito: false, diarreia: false, tosse: false, 
        dificuldadeRespiratoria: false, claudicacao: false, lesoesPele: false, 
        secrecaoNasal: false, secrecaoOcular: false,
        doencaPredita: diagnostico || "Sem diagnóstico"
      } as any;

      await updatePet(petId, {
        ...pet,
        tratamentos: [...(pet.tratamentos || []), ...novosTratamentos],
        exames: [...(pet.exames || []), ...novosExames],
        historico: [...(pet.historico || []), novoHistorico],
        diagnosticoAtual: diagnostico || pet.diagnosticoAtual
      });

      toast.success("Consulta finalizada com sucesso!");
      router.invalidate();
      navigate({ to: "/vet/teleconsultas" });
    } catch (err) {
      toast.error("Erro ao finalizar a consulta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl">Finalizar atendimento</h1>
        <p className="text-muted-foreground mt-1">Registre o desfecho da consulta de <span className="font-medium text-foreground">{pet.nome}</span>.</p>
      </div>

      <Card className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
        {laudoIA && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Parecer da IA (Laudo Preditivo)</Label>
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-md text-sm text-foreground/80 [&>h3]:font-bold [&>h3]:text-foreground [&>h3]:mt-3 [&>h3]:mb-1 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>strong]:text-foreground">
              <ReactMarkdown>{laudoIA}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Diagnóstico</Label>
          <Textarea 
            placeholder="Diagnóstico final (Ex: Dermatite alérgica sazonal leve)" 
            value={diagnostico} 
            onChange={e => setDiagnostico(e.target.value)} 
            className="min-h-[80px]" 
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Tratamentos / Prescrições</Label>
            <Button type="button" size="sm" variant="outline" onClick={addTratamento}><Plus className="h-4 w-4 mr-1" />Adicionar tratamento</Button>
          </div>
          
          {tratamentos.length > 0 ? (
            <Tabs value={activeTratamentoTab} onValueChange={setActiveTratamentoTab} className="mt-2 border border-border rounded-md p-1">
              <div className="overflow-x-auto">
                <TabsList className="w-full justify-start h-auto p-1 bg-transparent border-b border-border mb-2 rounded-none">
                  {tratamentos.map((t, i) => (
                    <TabsTrigger key={i} value={i.toString()} className="data-[state=active]:bg-secondary">
                      {t.nome || `Tratamento ${i + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {tratamentos.map((t, i) => (
                <TabsContent key={i} value={i.toString()} className="p-3 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Medicação / Título</Label>
                    <Input placeholder="Ex: Cetirizina 10mg" value={t.nome} onChange={evt => updateTratamento(i, 'nome', evt.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Posologia / Detalhes</Label>
                    <Textarea className="min-h-[80px]" placeholder="Ex: 1/2 comprimido VO 1x ao dia por 14 dias..." value={t.detalhes} onChange={evt => updateTratamento(i, 'detalhes', evt.target.value)} />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTratamento(i)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"><X className="h-4 w-4 mr-1" /> Remover prescrição</Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="border border-dashed border-border rounded-md p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Nenhum tratamento ou medicação prescrita.</p>
              <Button type="button" size="sm" onClick={addTratamento}><Plus className="h-4 w-4 mr-1" />Adicionar prescrição</Button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Exames a solicitar</Label>
            <Button type="button" size="sm" variant="outline" onClick={addExame}><Plus className="h-4 w-4 mr-1" />Adicionar exame</Button>
          </div>
          
          {exames.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2 border border-border rounded-md p-1">
              <div className="overflow-x-auto">
                <TabsList className="w-full justify-start h-auto p-1 bg-transparent border-b border-border mb-2 rounded-none">
                  {exames.map((e, i) => (
                    <TabsTrigger key={i} value={i.toString()} className="data-[state=active]:bg-secondary">
                      {e.nome || `Exame ${i + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {exames.map((e, i) => (
                <TabsContent key={i} value={i.toString()} className="p-3 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Nome do Exame</Label>
                    <Input placeholder="Ex: Ultrassom abdominal" value={e.nome} onChange={evt => updateExame(i, 'nome', evt.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Pedido médico (Instruções/Justificativa)</Label>
                    <Textarea className="min-h-[80px]" placeholder="Ex: Avaliar aspecto do fígado e vesícula biliar..." value={e.pedidoMedico} onChange={evt => updateExame(i, 'pedidoMedico', evt.target.value)} />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeExame(i)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"><X className="h-4 w-4 mr-1" /> Remover este exame</Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="border border-dashed border-border rounded-md p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">Nenhum exame solicitado nesta consulta.</p>
              <Button type="button" size="sm" onClick={addExame}><Plus className="h-4 w-4 mr-1" />Adicionar o primeiro exame</Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Observações para o tutor</Label>
          <Textarea 
            placeholder="Retorno em 14 dias, evitar gramado..." 
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            className="min-h-[60px]" 
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Link to="/vet/teleconsultas/$id" params={{ id }}><Button variant="outline" disabled={isSubmitting}>Cancelar</Button></Link>
          <Button onClick={handleSave} disabled={isSubmitting}>Salvar e encerrar</Button>
        </div>
      </Card>
    </div>
  );
}
