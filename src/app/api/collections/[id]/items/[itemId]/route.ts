import { jsonError, withViewer } from "@/lib/api";
import { removeItemFromCollection } from "@/modules/collections/service";

export const DELETE = withViewer<RouteContext<"/api/collections/[id]/items/[itemId]">>(async (_req, viewer, ctx) => {
  const { id, itemId } = await ctx.params;
  return (await removeItemFromCollection(viewer, id, itemId))
    ? new Response(null, { status: 204 })
    : jsonError(404, "Not found");
});
