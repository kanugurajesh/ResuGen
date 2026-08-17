"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/memory", label: "Memory bank" },
  { href: "/applications", label: "Applications" },
];

export function AppNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-rule bg-paper px-6 py-8">
      <div>
        <Link href="/dashboard" className="block font-display text-lg font-semibold text-ink">
          Resume<span className="text-accent">/</span>Builder
        </Link>
        <nav className="mt-10 flex flex-col gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-sm px-2.5 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-accent-soft text-accent-strong font-medium"
                    : "text-ink-soft hover:bg-rule/40 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col gap-2 border-t border-rule pt-4">
        <span className="truncate font-mono text-[11px] text-ink-faint">{userEmail}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-left text-xs text-ink-soft hover:text-accent"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
