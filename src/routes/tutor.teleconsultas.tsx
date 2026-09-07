import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tutor/teleconsultas")({
  component: () => <Outlet />,
});
