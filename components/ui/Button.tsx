import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-accent text-paper hover:bg-accent-strong px-4 py-2",
  secondary:
    "border border-rule-strong text-ink hover:border-accent hover:text-accent px-4 py-2 bg-transparent",
  ghost: "text-ink-soft hover:text-ink px-2 py-1",
  danger: "text-match-bad hover:bg-match-bad-soft px-3 py-1.5",
};

type Variant = keyof typeof variants;

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ className = "", variant = "primary", ...props }, ref) {
  return (
    <button ref={ref} className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
});

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
