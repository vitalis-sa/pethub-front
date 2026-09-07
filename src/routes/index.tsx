import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PawPrint, Video, Stethoscope, ShieldCheck, Clock, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PetHub — Teleconsulta veterinária com prontuário completo" },
      { name: "description", content: "PetHub conecta tutores e veterinários: agenda, prontuário e teleconsulta em um só lugar." },
      { property: "og:title", content: "PetHub — Teleconsulta veterinária" },
      { property: "og:description", content: "Cuide do seu pet onde estiver." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 overflow-hidden" style={{ backgroundColor: '#FFF9F1', backgroundImage: "url('/xadrez.png')", backgroundRepeat: 'repeat', backgroundSize: '430px' }}>
        <div className="w-full px-6 h-16 flex items-center justify-between">
          {/* Logo — canto esquerdo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0">
              <img src="/logo-noname.png" alt="PetHub logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-[48px] leading-none uppercase translate-y-[2px]" style={{ fontFamily: '"Extenda 40 Hecto", "Extenda", "Anton", sans-serif', color: '#0C2476', letterSpacing: '0.02em' }}>PETHUB</span>
          </Link>

          {/* Links de navegação centrais */}
          <nav className="hidden md:flex items-center gap-3 text-sm">
            <a href="#como-funciona" className="px-4 py-1.5 rounded-md font-medium text-foreground border-2 border-primary hover:bg-primary hover:text-white transition-colors" style={{ background: '#FFFAEE' }}>Como funciona</a>
            <a href="#para-quem" className="px-4 py-1.5 rounded-md font-medium text-foreground border-2 border-primary hover:bg-primary hover:text-white transition-colors" style={{ background: '#FFFAEE' }}>Para quem é</a>
            <a href="#confianca" className="px-4 py-1.5 rounded-md font-medium text-foreground border-2 border-primary hover:bg-primary hover:text-white transition-colors" style={{ background: '#FFFAEE' }}>Confiança</a>
          </nav>

          {/* Botão Entrar — canto direito */}
          <Link to="/login">
            <Button variant="default" className="rounded-md border-2" style={{ borderColor: '#FFFAEE' }}>Entrar</Button>
          </Link>
        </div>
      </header>


      {/* Hero */}
      <section className="relative overflow-hidden">

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-brand-deep/10 text-brand-deep text-xs font-medium border border-brand-deep/20">
              <span className="h-1.5 w-1.5 rounded-md bg-brand-deep" /> Novo · Teleconsulta com IA assistiva
            </div>
            <h1 className="mt-6 text-5xl md:text-6xl font-display leading-[1.05]">
              O consultório do seu pet,<br />
              <span className="italic text-primary">onde vocês estiverem.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              Prontuário compartilhado, agenda inteligente e teleconsulta humanizada — tudo num só lugar, para tutores e veterinários.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link to="/login"><Button size="lg" className="rounded-md">Começar agora <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <a href="#como-funciona"><Button size="lg" variant="outline" className="rounded-md">Ver como funciona</Button></a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex gap-2">
                {["🐶", "🐱", "🐰", "🦜"].map((e, i) => (
                  <div key={i} className="h-8 w-8 rounded-full bg-brand-deep/15 border-2 border-background grid place-items-center text-sm">{e}</div>
                ))}
              </div>
              <span>+2.400 pets acompanhados</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-md bg-card p-2 shadow-[var(--shadow-glow)] border border-border">
              <div className="rounded-md bg-brand-deep/15 aspect-[4/5] grid place-items-center relative overflow-hidden">
                <div className="text-[180px] leading-none">🐕</div>
                <div className="absolute bottom-4 left-4 right-4 rounded-md bg-background/90 backdrop-blur p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-brand-deep/15 grid place-items-center text-xl">👩‍⚕️</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dra. Helena em atendimento</p>
                      <p className="text-xs text-muted-foreground">Bento · Golden Retriever · 5 anos</p>
                    </div>
                    <span className="h-2 w-2 rounded-md bg-success animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -left-6 top-10 rounded-md bg-card border border-border p-4 shadow-[var(--shadow-soft)] hidden md:block">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-4 w-4 text-brand-deep" />
                <span className="font-medium">Próxima consulta</span>
              </div>
              <p className="text-sm mt-1">Hoje, 14:30</p>
            </div>
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section id="para-quem" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Para quem é</p>
          <h2 className="mt-3 text-4xl font-display">Dois mundos, uma plataforma.</h2>
        </div>
        <div className="mt-14 grid md:grid-cols-2 gap-6">
          <div className="rounded-md border border-border bg-card p-8">
            <div className="h-12 w-12 rounded-md bg-brand-deep/10 grid place-items-center text-brand-deep"><Stethoscope className="h-6 w-6" /></div>
            <h3 className="text-2xl font-display mt-5">Para veterinários</h3>
            <p className="text-muted-foreground mt-2">Agenda do dia, prontuário completo do pet, histórico do tutor e teleconsulta com sugestões de diagnóstico assistidas por IA.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {["Cadastro e busca de pets e tutores", "Sala de teleconsulta com prontuário lateral", "Finalização com exames e prescrição"].map(s => (
                <li key={s} className="flex gap-2"><span className="text-brand-deep">•</span>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-border bg-card p-8">
            <div className="h-12 w-12 rounded-md bg-brand-deep/10 grid place-items-center text-brand-deep"><Heart className="h-6 w-6" /></div>
            <h3 className="text-2xl font-display mt-5">Para tutores</h3>
            <p className="text-muted-foreground mt-2">Todos os seus pets em cards, histórico completo, lembretes de vacina e teleconsulta sem sair de casa.</p>
            <ul className="mt-5 space-y-2 text-sm">
              {["Cards de pets com histórico clínico", "Agenda e marcação de teleconsulta", "Lembretes automáticos"].map(s => (
                <li key={s} className="flex gap-2"><span className="text-brand-deep">•</span>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-24 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-display text-center">Em três passos.</h2>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              { n: "01", t: "Cadastre o pet", d: "Espécie, raça, peso, tutor — tudo num único formulário." },
              { n: "02", t: "Marque a teleconsulta", d: "Escolha o horário, descreva as queixas e pronto." },
              { n: "03", t: "Atenda em vídeo", d: "Sala com prontuário, sintomas e diagnóstico assistido." },
            ].map(s => (
              <div key={s.n} className="rounded-md bg-card border border-border p-6">
                <p className="font-display text-5xl text-brand-deep/30">{s.n}</p>
                <h3 className="text-xl font-display mt-3">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confiança */}
      <section id="confianca" className="py-24 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
        {[
          { i: ShieldCheck, t: "Dados criptografados", d: "Seu prontuário é só seu." },
          { i: Video, t: "Vídeo em alta definição", d: "WebRTC ponto-a-ponto." },
          { i: Heart, t: "Atendimento humanizado", d: "Tecnologia que aproxima." },
        ].map((b, i) => {
          const I = b.i;
          return (
            <div key={i} className="rounded-md p-6 bg-card border border-border">
              <I className="h-6 w-6 text-brand-deep" />
              <p className="font-display text-lg mt-3">{b.t}</p>
              <p className="text-sm text-muted-foreground mt-1">{b.d}</p>
            </div>
          );
        })}
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        © 2026 PetHub — Feito com 🧡 para pets e seus humanos.
      </footer>
    </div>
  );
}
