import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ReportsLoading() {
  return (
    <section className="grid gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </CardHeader>
      </Card>

      <Card className="bg-slate-950 text-white">
        <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-40 bg-white/15" />
            <Skeleton className="h-10 w-72 bg-white/15" />
            <Skeleton className="h-5 w-full max-w-xl bg-white/15" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-20 w-full min-w-32 bg-white/15" />
            <Skeleton className="h-20 w-full min-w-32 bg-white/15" />
            <Skeleton className="h-20 w-full min-w-32 bg-white/15" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent className="grid gap-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </CardContent>
      </Card>
    </section>
  );
}
