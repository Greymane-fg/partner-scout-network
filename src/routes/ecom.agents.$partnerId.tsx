import { createFileRoute } from "@tanstack/react-router";
import { AgentProfilePage } from "@/components/agent-profile";

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
  component: EcomAgentProfile,
});

function EcomAgentProfile() {
  const { partnerId } = Route.useParams();
  return <AgentProfilePage partnerId={partnerId} view="ecom" />;
}
