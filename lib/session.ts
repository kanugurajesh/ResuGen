import { auth } from "@/auth";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new SessionError();
  }
  return session.user.id;
}

export class SessionError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "SessionError";
  }
}
