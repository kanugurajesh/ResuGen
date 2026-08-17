import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAuth } from "@/lib/api";
import { updateProfile } from "@/lib/memory/store";

export const GET = withAuth(async (_req, userId) => {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  return NextResponse.json(profile);
});

export const PUT = withAuth(async (req, userId) => {
  const body = await req.json();
  const profile = await updateProfile(userId, body);
  return NextResponse.json(profile);
});
