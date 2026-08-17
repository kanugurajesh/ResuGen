import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUserId, SessionError } from "@/lib/session";

type Handler<Ctx> = (req: NextRequest, userId: string, ctx: Ctx) => Promise<NextResponse>;

export function withAuth<Ctx = unknown>(handler: Handler<Ctx>) {
  return async (req: NextRequest, ctx: Ctx) => {
    try {
      const userId = await requireUserId();
      return await handler(req, userId, ctx);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof SessionError) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid input", details: err.flatten() },
      { status: 400 }
    );
  }
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
