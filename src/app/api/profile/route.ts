import { NextResponse } from "next/server";
import { withViewer } from "@/lib/api";
import { updateProfile } from "@/modules/profile/service";

export const PATCH = withViewer(async (req, viewer) => NextResponse.json(await updateProfile(viewer, await req.json())));
