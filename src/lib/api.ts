import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getViewer, type Viewer } from "@/modules/auth/session";
import { ValidationError } from "@/modules/items/service";

export const jsonError = (status: number, error: string) => NextResponse.json({ error }, { status });

/**
 * Wraps a route handler: rejects unauthenticated requests and maps validation
 * errors to 400 so handlers only deal with the happy path.
 */
export function withViewer<C>(handler: (req: Request, viewer: Viewer, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    const viewer = await getViewer();
    if (!viewer) return jsonError(401, "Unauthorized");
    try {
      return await handler(req, viewer, ctx);
    } catch (err) {
      if (err instanceof ZodError) return jsonError(400, err.issues[0]?.message ?? "Invalid input");
      if (err instanceof ValidationError) return jsonError(400, err.message);
      if (err instanceof SyntaxError) return jsonError(400, "Invalid JSON");
      throw err;
    }
  };
}
