import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { getMemoryBank } from "@/lib/memory/store";

export const GET = withAuth(async (_req, userId) => {
  const bank = await getMemoryBank(userId);
  return NextResponse.json(bank);
});
