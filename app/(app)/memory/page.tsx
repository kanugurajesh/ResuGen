import { auth } from "@/auth";
import { getMemoryBank } from "@/lib/memory/store";
import { MemoryBankApp } from "@/components/memory/MemoryBankApp";

export default async function MemoryPage() {
  const session = await auth();
  const bank = await getMemoryBank(session!.user.id);

  return <MemoryBankApp initialBank={bank} />;
}
