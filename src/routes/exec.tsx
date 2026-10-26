import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ViewShell } from "@/components/shell";

export const Route = createFileRoute("/exec")({
  component: () => (
    <ViewShell view="exec">
      <Outlet />
    </ViewShell>
  ),
});
