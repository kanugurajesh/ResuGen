import Link from "next/link";

export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rule px-8 py-5 sm:px-12">
        <Link href="/" className="font-display text-lg font-semibold text-ink">
          Resume<span className="text-accent">/</span>Builder
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm rounded-sm border border-rule bg-paper-raised p-8">
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          <div className="mt-6">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
