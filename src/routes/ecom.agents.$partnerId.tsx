import { createFileRoute, notFound } from "@tanstack/react-router";
import { AgentProfilePage } from "@/components/agent-profile";
import { agentProfileQuery } from "@/lib/queries";

export const Route = createFileRoute("/ecom/agents/$partnerId")({
  head: ({ loaderData }) => {
    const name = loaderData?.agent?.fullName ?? "Partner";
    return [
      {
        title: `${name} — Ecommerce Partner, Partner Hub`,
        name: "description",
        content: `${name}'s profile: skills, projects, reviews and every way to get in touch.`,
      },
      { property: "og:title", content: `${name} — Ecommerce Partner, Partner Hub` },
      {
        property: "og:description",
        content: `${name}'s profile: skills, projects, reviews and every way to get in touch.`,
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
  },
  loader: async ({ params, context }) => ({
    agent: await context.queryClient.ensureQueryData(agentProfileQuery(params.partnerId, "ecom")),
  }),
  component: EcomAgentProfile,
});

function EcomAgentProfile() {
  const { partnerId } = Route.useParams();
  const { agent } = Route.useLoaderData();
  if (!agent) throw notFound();
  return <AgentProfilePage partnerId={partnerId} view="ecom" />;
}
