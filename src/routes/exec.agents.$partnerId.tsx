import { createFileRoute } from "@tanstack/react-router";
import { AgentProfilePage } from "@/components/agent-profile";
import { notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/exec/agents/$partnerId")({
  head: ({ loaderData }) => {
    const name = loaderData?.agent?.fullName ?? "Partner";
    return [
      {
        title: `${name} — Executive Partner, Partner Hub`,
        name: "description",
        content: `${name}'s profile: skills, projects, reviews and every way to get in touch.`,
      },
      { property: "og:title", content: `${name} — Executive Partner, Partner Hub` },
      {
        property: "og:description",
        content: `${name}'s profile: skills, projects, reviews and every way to get in touch.`,
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
  },
  loader: async ({ params, context }) => ({
    agent: await context.queryClient.ensureQueryData(agentProfileLoader(params.partnerId)),
  }),
  component: ExecAgentProfile,
});

function agentProfileLoader(partnerId: string) {
  // Imported lazily to keep this file lean; same query as the component.
  const { agentProfileQuery } = require("@/lib/queries") as typeof import("@/lib/queries");
  return agentProfileQuery(partnerId, "exec");
}

function ExecAgentProfile() {
  const { partnerId } = Route.useParams();
  const { agent } = Route.useLoaderData();
  if (!agent) throw notFound();
  return <AgentProfilePage partnerId={partnerId} view="exec" />;
}
