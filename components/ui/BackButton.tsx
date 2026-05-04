"use client";

import { useRouter } from "next/navigation";

import { ArrowLeftIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({
  fallbackHref = "/dashboard",
  label = "Back"
}: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <Button className="w-fit" onClick={handleBack} type="button" variant="ghost">
      <ArrowLeftIcon className="h-4 w-4" />
      {label}
    </Button>
  );
}
