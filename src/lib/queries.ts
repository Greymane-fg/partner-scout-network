import type { View } from "@/lib/agents.functions";
import {
  getAgent,
  getBlogPost,
  getViewHighlights,
  listAgents,
  listBlogPosts,
} from "@/lib/agents.functions";

export function agentListQuery(view: View) {
  return {
    queryKey: ["agents", view],
    queryFn: () => listAgents({ data: view }),
  };
}

export function agentProfileQuery(partnerId: string, view: View) {
  return {
    queryKey: ["agent", partnerId, view],
    queryFn: () => getAgent({ data: { partnerId, view } }),
  };
}

export function blogListQuery() {
  return {
    queryKey: ["blog", "list"],
    queryFn: () => listBlogPosts(),
  };
}

export function blogPostQuery(slug: string) {
  return {
    queryKey: ["blog", slug],
    queryFn: () => getBlogPost({ data: { slug } }),
  };
}

export function viewHighlightsQuery(view: View) {
  return {
    queryKey: ["highlights", view],
    queryFn: () => getViewHighlights({ data: view }),
  };
}
