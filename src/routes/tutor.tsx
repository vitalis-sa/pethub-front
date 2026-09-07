import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/tutor")({
  component: () => (
    <AppShell role="tutor">
      <Outlet />
    </AppShell>
  ),
});
