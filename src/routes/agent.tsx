import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ViewShell } from "@/components/shell";

export const Route = createFileRoute("/agent")({
  component: () => (
    <ViewShell view="agent" sessionAware>
      <Outlet />
    </ViewShell>
  ),
});
