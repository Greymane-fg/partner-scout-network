import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AgentProfilePage } from "@/components/agent-profile";
import { agentProfileQuery } from "@/lib/queries";

export const Route = createFileRoute("/ecom/agents/$partnerId")({
  head: (ctx) => {
    const name = (ctx.loaderData as { fullName?: string } | null)?.fullName ?? "Partner";
    return {
      meta: [
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
      ],
    };
  },
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(agentProfileQuery(params.partnerId, "ecom")),
  component: EcomAgentProfile,
});

function EcomAgentProfile() {
  const { partnerId } = Route.useParams();
  const { data: agent } = useSuspenseQuery(agentProfileQuery(partnerId, "ecom"));
  if (!agent) throw notFound();
  return <AgentProfilePage partnerId={partnerId} view="ecom" />;
}
