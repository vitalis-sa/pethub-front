import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, PawPrint, Users, Video, User, Bell, LogOut, Stethoscope, Heart, Menu,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const vetNav: NavItem[] = [
  { to: "/vet", label: "Início", icon: LayoutDashboard },
  { to: "/vet/pets", label: "Pets", icon: PawPrint },
  { to: "/vet/tutores", label: "Tutores", icon: Users },
  { to: "/vet/teleconsultas", label: "Teleconsultas", icon: Video },
  { to: "/vet/perfil", label: "Meu perfil", icon: User },
];

const tutorNav: NavItem[] = [
  { to: "/tutor", label: "Início", icon: LayoutDashboard },
  { to: "/tutor/teleconsultas", label: "Teleconsultas", icon: Video },
  { to: "/tutor/lembretes", label: "Lembretes", icon: Bell },
  { to: "/tutor/perfil", label: "Meu perfil", icon: User },
];

function SidebarContent({ role, nav, pathname, onNavigate }: { role: "vet" | "tutor"; nav: NavItem[]; pathname: string; onNavigate?: () => void }) {
  const isVet = role === "vet";
  return (
    <>
      {/* Logo + nome */}
      <div className="px-5 py-5 flex items-center border-b border-[#D4751E]">
        <div className="flex items-center gap-3 bg-[#FFF9F1] border-2 border-[#D4751E] rounded-md pr-3 w-full shadow-sm overflow-hidden">
          <div className="h-14 w-14 shrink-0 bg-white ml-2">
            <img src="/logo-noname.png" alt="PetHub logo" className="h-full w-full object-cover" />
          </div>
          <div className="py-2">
            <p className="text-2xl leading-none uppercase" style={{ fontFamily: '"Extenda 40 Hecto", "Extenda", "Anton", sans-serif', color: '#0C2476', letterSpacing: '0.02em' }}>PETHUB</p>
            <p className="text-[10px] mt-0.5 font-bold uppercase tracking-wider" style={{ color: '#D4751E' }}>{isVet ? "Veterinário" : "Tutor"}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => {
          const active = pathname === item.to || (item.to !== `/${role}` && pathname.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors border-2"
              style={active
                ? { background: '#D4751E', borderColor: '#FFF9F1', color: '#FFF9F1' }
                : { background: '#FFF9F1', borderColor: '#D4751E', color: '#0C2476' }
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sair */}
      <div className="p-3 border-t border-[#D4751E]">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium border-2 transition-colors"
          style={{ background: '#FFF9F1', borderColor: '#D4751E', color: '#0C2476' }}
        >
          <LogOut className="h-4 w-4" /> Sair
        </Link>
      </div>
    </>
  );
}

export function AppShell({ role, children }: { role: "vet" | "tutor"; children: ReactNode }) {
  const nav = role === "vet" ? vetNav : tutorNav;
  const pathname = useRouterState({ select: s => s.location.pathname });
  const isVet = role === "vet";
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col z-30"
        style={{ backgroundColor: '#FFF9F1', backgroundImage: "url('/xadrez.png')", backgroundRepeat: 'repeat', backgroundSize: '515px' }}>
        <div className="flex-1 flex flex-col min-h-0">
          <SidebarContent role={role} nav={nav} pathname={pathname} />
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="lg:hidden sticky top-0 z-40"
        style={{ backgroundColor: '#FFF9F1', backgroundImage: "url('/xadrez.png')", backgroundRepeat: 'repeat', backgroundSize: '515px' }}>
        <div className="flex items-center justify-between gap-3 px-4 h-14">
          <Link to={isVet ? "/vet" : "/tutor"} className="flex items-center gap-2 min-w-0">
              <div className="h-10 w-10 rounded-md overflow-hidden shrink-0 bg-white">
                <img src="/logo-noname.png" alt="PetHub logo" className="h-full w-full object-cover" />
              </div>
            <p className="text-2xl leading-none truncate uppercase" style={{ fontFamily: '"Extenda 40 Hecto", "Extenda", "Anton", sans-serif', color: '#0C2476', letterSpacing: '0.02em' }}>PETHUB</p>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 flex flex-col"
              style={{ backgroundColor: '#FFF9F1', backgroundImage: "url('/xadrez.png')", backgroundRepeat: 'repeat', backgroundSize: '515px' }}>
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SidebarContent role={role} nav={nav} pathname={pathname} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </header>


      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6 lg:mb-8 gap-3 flex-wrap">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-display truncate">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
