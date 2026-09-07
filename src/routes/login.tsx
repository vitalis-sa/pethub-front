import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Heart, Loader2 } from "lucide-react";
import { createVet } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — PetHub" }, { name: "description", content: "Acesse sua conta PetHub como veterinário ou tutor." }] }),
  component: Login,
});

function Login() {
  const [role, setRole] = useState<"vet" | "tutor">("vet");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: role === "vet" ? "/vet" : "/tutor" });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nome = formData.get("nome") as string;
    const crmv = formData.get("crmv") as string;
    const especialidade = formData.get("especialidade") as string;
    const email = formData.get("email") as string;
    const password = formData.get("senha") as string;
    const sexo = formData.get("sexo") as string;
    const data_nascimento = formData.get("data_nascimento") as string;

    if (!nome || !crmv || !email || !password || !sexo || !data_nascimento) return toast.error("Preencha os campos obrigatórios");

    setIsLoading(true);
    try {
      await createVet({ nome, crmv, especialidade, email, password, sexo, data_nascimento, foto: "👩‍⚕️" } as any);
      toast.success("Veterinário cadastrado com sucesso!");
      setIsRegistering(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden" style={{ backgroundColor: '#D4751E' }}>
        <Link to="/" className="flex items-center gap-2 text-primary-foreground">
          <div className="h-12 w-12 rounded-md grid place-items-center overflow-hidden"><img src="/logo-noname.png" className="h-full w-full object-contain"/></div>
          <span className="text-4xl uppercase leading-none" style={{ fontFamily: '"Extenda 40 Hecto", "Extenda", "Anton", sans-serif', letterSpacing: '0.02em', color: '#0C2476' }}>PETHUB</span>
        </Link>
        <div className="text-primary-foreground">
          <p className="text-7xl">🐾</p>
          <h2 className="font-display text-4xl mt-6 leading-tight">Bem-vindo de volta.</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-sm">Seu consultório e o prontuário dos pets esperando por você.</p>
        </div>
        <p className="text-primary-foreground/70 text-sm">© 2026 PetHub</p>
      </div>

      <div className="flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-display">{isRegistering ? "Criar Conta" : "Entrar"}</h1>
          <p className="text-muted-foreground mt-2">
            {isRegistering ? "Cadastre-se como Médico Veterinário." : "Escolha o tipo de acesso para continuar."}
          </p>

          {!isRegistering && (
            <div className="mt-6 grid grid-cols-2 gap-2 p-1 rounded-md bg-muted">
              <button
                onClick={() => setRole("vet")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${role === "vet" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              >
                <Stethoscope className="h-4 w-4" /> Veterinário
              </button>
              <button
                onClick={() => setRole("tutor")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${role === "tutor" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              >
                <Heart className="h-4 w-4" /> Tutor
              </button>
            </div>
          )}

          {isRegistering ? (
            <form className="mt-6 space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" name="nome" placeholder="Dra. Helena..." required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crmv">CRMV</Label>
                  <Input id="crmv" name="crmv" placeholder="12345-SP" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Input id="especialidade" name="especialidade" placeholder="Clínica Geral" />
                </div>
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
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" placeholder="vet@pethub.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" name="senha" type="password" required />
              </div>
              <Button type="submit" className="w-full rounded-md" size="lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Finalizar Cadastro
              </Button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => setIsRegistering(false)} className="text-sm text-primary hover:underline">Já tenho uma conta</button>
              </div>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="voce@email.com" defaultValue={role === "vet" ? "helena@pethub.vet" : "mariana@email.com"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" defaultValue="••••••••" />
              </div>
              <Button type="submit" className="w-full rounded-md" size="lg">Entrar como {role === "vet" ? "veterinário" : "tutor"}</Button>
              {role === "vet" && (
                <div className="text-center mt-4">
                  <button type="button" onClick={() => setIsRegistering(true)} className="text-sm text-primary hover:underline">Não tem conta? Cadastre-se</button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
