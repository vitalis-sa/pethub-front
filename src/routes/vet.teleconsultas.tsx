import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/vet/teleconsultas")({
  component: () => <Outlet />,
});
