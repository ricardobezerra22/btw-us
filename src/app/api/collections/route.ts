import { NextResponse } from "next/server";
import { withViewer } from "@/lib/api";
import { createCollection, listCollections } from "@/modules/collections/service";

export const GET = withViewer(async (_req, viewer) => NextResponse.json(await listCollections(viewer)));

export const POST = withViewer(async (req, viewer) =>
  NextResponse.json(await createCollection(viewer, await req.json()), { status: 201 }),
);
