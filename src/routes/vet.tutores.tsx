import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/vet/tutores")({
  component: () => <Outlet />,
});
