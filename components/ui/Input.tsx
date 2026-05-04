import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { useId } from "react";

import { ChevronDownIcon } from "@/components/ui/Icons";
import { cn } from "@/utils/helpers";

interface BaseFieldProps {
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  success?: boolean;
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
  icon,
  success,
  children
}: BaseFieldProps & { children: ReactNode }) {
  return (
    <label className="grid gap-2.5 text-sm font-medium text-slate-700">
      <span
        className={cn(
          "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em]",
          error ? "text-red-500" : success ? "text-green-600" : "text-slate-500"
        )}
      >
        {icon ? <span className={cn(error ? "text-red-500" : success ? "text-green-500" : "text-blue-600")}>{icon}</span> : null}
        {label}
      </span>
      {children}
      {hint ? <span className="text-xs leading-6 text-slate-500">{hint}</span> : null}
      {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}

const baseClassName =
  "w-full rounded-[1.35rem] border bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.04)] outline-none transition duration-200 placeholder:text-slate-400";

function getFieldStateClassName(error?: string, success?: boolean) {
  if (error) {
    return "border-red-500/80 focus:border-red-500 focus:ring-4 focus:ring-red-500/10";
  }

  if (success) {
    return "border-green-500/70 focus:border-green-500 focus:ring-4 focus:ring-green-500/10";
  }

  return "border-slate-200 hover:border-blue-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10";
}

export function Input({ label, hint, error, icon, success, className, ...props }: InputProps) {
  const id = useId();

  return (
    <FieldWrapper error={error} hint={hint} icon={icon} label={label} success={success}>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          aria-invalid={Boolean(error)}
          className={cn(baseClassName, getFieldStateClassName(error, success), icon && "pl-12", className)}
          id={props.id ?? id}
          {...props}
        />
      </div>
    </FieldWrapper>
  );
}

export function Select({ label, hint, error, icon, options, success, className, ...props }: SelectProps) {
  const id = useId();

  return (
    <FieldWrapper error={error} hint={hint} icon={icon} label={label} success={success}>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <select
          aria-invalid={Boolean(error)}
          className={cn(
            baseClassName,
            getFieldStateClassName(error, success),
            "appearance-none pr-11",
            icon && "pl-12",
            className
          )}
          id={props.id ?? id}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </FieldWrapper>
  );
}

export function Textarea({ label, hint, error, icon, success, className, ...props }: TextareaProps) {
  const id = useId();

  return (
    <FieldWrapper error={error} hint={hint} icon={icon} label={label} success={success}>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-4 text-slate-400">{icon}</span>
        ) : null}
        <textarea
          aria-invalid={Boolean(error)}
          className={cn(
            baseClassName,
            getFieldStateClassName(error, success),
            "min-h-32 resize-y",
            icon && "pl-12",
            className
          )}
          id={props.id ?? id}
          {...props}
        />
      </div>
    </FieldWrapper>
  );
}
