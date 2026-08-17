import { InputHTMLAttributes, TextareaHTMLAttributes, LabelHTMLAttributes } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={`font-mono text-[11px] uppercase tracking-wide text-ink-soft ${props.className ?? ""}`}
    />
  );
}

const inputBase =
  "w-full rounded-sm border border-rule-strong bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputBase} ${props.className ?? ""}`} />;
}
