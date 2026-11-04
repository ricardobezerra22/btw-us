import { jsonError, withViewer } from "@/lib/api";
import { deleteCollection, updateCollection } from "@/modules/collections/service";

type Ctx = RouteContext<"/api/collections/[id]">;

export const PATCH = withViewer<Ctx>(async (req, viewer, ctx) => {
  const { id } = await ctx.params;
  return (await updateCollection(viewer, id, await req.json()))
    ? new Response(null, { status: 204 })
    : jsonError(404, "Not found");
});

export const DELETE = withViewer<Ctx>(async (_req, viewer, ctx) => {
  const { id } = await ctx.params;
  return (await deleteCollection(viewer, id)) ? new Response(null, { status: 204 }) : jsonError(404, "Not found");
});
