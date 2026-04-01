import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { useId } from "react";

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
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

const baseClassName =
  "w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-950/5 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

export function Input({ label, hint, error, className, ...props }: InputProps) {
  const id = useId();

  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <input
        aria-invalid={Boolean(error)}
        className={cn(baseClassName, className)}
        id={props.id ?? id}
        {...props}
      />
    </FieldWrapper>
  );
}

export function Select({ label, hint, error, options, className, ...props }: SelectProps) {
  const id = useId();

  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <select
        aria-invalid={Boolean(error)}
        className={cn(baseClassName, className)}
        id={props.id ?? id}
        {...props}
      >
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
  const id = useId();

  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <textarea
        aria-invalid={Boolean(error)}
        className={cn(baseClassName, "min-h-32 resize-y", className)}
        id={props.id ?? id}
        {...props}
      />
    </FieldWrapper>
  );
}
