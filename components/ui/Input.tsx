import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";

import { cn } from "@/utils/helpers";

interface BaseFieldProps {
  label: string;
  hint?: string;
  error?: string;
}

interface InputProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {}

interface SelectProps extends BaseFieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ label: string; value: string }>;
}

interface TextareaProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

function FieldWrapper({
  label,
  hint,
  error,
  children
}: BaseFieldProps & { children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

const baseClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <input className={cn(baseClassName, className)} {...props} />
    </FieldWrapper>
  );
}

export function Select({ label, hint, error, options, className, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <select className={cn(baseClassName, className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

export function Textarea({ label, hint, error, className, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <textarea className={cn(baseClassName, "min-h-28 resize-y", className)} {...props} />
    </FieldWrapper>
  );
}
