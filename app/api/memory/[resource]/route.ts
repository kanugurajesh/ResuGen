import { NextResponse } from "next/server";
import { withAuth, ApiError } from "@/lib/api";
import { createResource, isResourceKey } from "@/lib/memory/store";

export const POST = withAuth<{ params: Promise<{ resource: string }> }>(
  async (req, userId, ctx) => {
    const { resource } = await ctx.params;
    if (!isResourceKey(resource)) throw new ApiError(404, "Unknown resource");
    const body = await req.json();
    const created = await createResource(userId, resource, body);
    return NextResponse.json(created, { status: 201 });
  }
);
