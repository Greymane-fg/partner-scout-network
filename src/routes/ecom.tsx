import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ViewShell } from "@/components/shell";

export const Route = createFileRoute("/ecom")({
  component: () => (
    <ViewShell view="ecom">
      <Outlet />
    </ViewShell>
  ),
});
