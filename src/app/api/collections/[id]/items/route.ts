import { jsonError, withViewer } from "@/lib/api";
import { collectionItemSchema } from "@/modules/collections/schemas";
import { addItemToCollection } from "@/modules/collections/service";

export const POST = withViewer<RouteContext<"/api/collections/[id]/items">>(async (req, viewer, ctx) => {
  const { id } = await ctx.params;
  const { itemId } = collectionItemSchema.parse(await req.json());
  return (await addItemToCollection(viewer, id, itemId))
    ? new Response(null, { status: 204 })
    : jsonError(404, "Not found");
});
