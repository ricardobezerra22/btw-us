import { NextResponse } from "next/server";
import { withViewer } from "@/lib/api";
import { feedQuerySchema } from "@/modules/items/schemas";
import { createItem, listFeed } from "@/modules/items/service";

export const GET = withViewer(async (req, viewer) => {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  return NextResponse.json(await listFeed(viewer, feedQuerySchema.parse(params)));
});

export const POST = withViewer(async (req, viewer) => {
  return NextResponse.json(await createItem(viewer, await req.json()), { status: 201 });
});
