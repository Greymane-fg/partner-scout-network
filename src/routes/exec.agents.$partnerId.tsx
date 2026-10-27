import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AgentProfilePage } from "@/components/agent-profile";
import { agentProfileQuery } from "@/lib/queries";

export const Route = createFileRoute("/exec/agents/$partnerId")({
  head: ({ loaderData }) => {
    const name = loaderData?.fullName ?? "Partner";
    return {
      meta: [
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
      ],
    };
  },
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(agentProfileQuery(params.partnerId, "exec")),
  component: ExecAgentProfile,
});

function ExecAgentProfile() {
  const { partnerId } = Route.useParams();
  const { data: agent } = useSuspenseQuery(agentProfileQuery(partnerId, "exec"));
  if (!agent) throw notFound();
  return <AgentProfilePage partnerId={partnerId} view="exec" />;
}
