import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1">
      <AppNav userEmail={session.user.email ?? ""} />
      <main className="flex-1 px-8 py-10 sm:px-12">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
