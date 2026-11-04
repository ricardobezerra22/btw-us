import { jsonError, withViewer } from "@/lib/api";
import { deleteItem } from "@/modules/items/service";

export const DELETE = withViewer<RouteContext<"/api/items/[id]">>(async (_req, viewer, ctx) => {
  const { id } = await ctx.params;
  return (await deleteItem(viewer, id)) ? new Response(null, { status: 204 }) : jsonError(404, "Not found");
});
