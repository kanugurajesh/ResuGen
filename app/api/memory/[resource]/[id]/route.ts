import { NextResponse } from "next/server";
import { withAuth, ApiError } from "@/lib/api";
import { updateResource, deleteResource, isResourceKey } from "@/lib/memory/store";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export const PATCH = withAuth<Ctx>(async (req, userId, ctx) => {
  const { resource, id } = await ctx.params;
  if (!isResourceKey(resource)) throw new ApiError(404, "Unknown resource");
  const body = await req.json();
  const updated = await updateResource(userId, resource, id, body);
  return NextResponse.json(updated);
});

export const DELETE = withAuth<Ctx>(async (_req, userId, ctx) => {
  const { resource, id } = await ctx.params;
  if (!isResourceKey(resource)) throw new ApiError(404, "Unknown resource");
  await deleteResource(userId, resource, id);
  return NextResponse.json({ ok: true });
});
