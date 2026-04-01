import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);
}

export function toOptions<T, TLabelKey extends keyof T, TValueKey extends keyof T>(
  items: T[],
  labelKey: TLabelKey,
  valueKey: TValueKey
) {
  return items.map((item) => ({
    label: String(item[labelKey] ?? ""),
    value: String(item[valueKey] ?? "")
  }));
}
