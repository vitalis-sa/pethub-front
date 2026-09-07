import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { getTeleconsulta } from "@/services/api";

export const Route = createFileRoute("/tutor/teleconsultas/$id")({
  loader: async ({ params }) => {
    try {
      await getTeleconsulta(params.id);
    } catch {
      throw notFound();
    }
  },
  component: () => <Outlet />,
  notFoundComponent: () => <p>Teleconsulta não encontrada.</p>,
});
