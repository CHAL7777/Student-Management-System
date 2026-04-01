import Link from "next/link";

import { ReportTable } from "@/components/reports/ReportTable";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/ui/Motion";
import { getDashboardMetrics } from "@/lib/queries";
import { requireRole } from "@/lib/auth";

export default async function StudentDashboardPage() {
  const profile = await requireRole(["student"]);
  const metrics = await getDashboardMetrics(profile);

  return (
    <section className="grid gap-6">
      <FadeIn>
        <PageHeader
          actions={
            <>
              <Link href="/reports">
                <Button variant="secondary">Open my report</Button>
              </Link>
              <Link href="/dashboard/password">
                <Button variant="ghost">Change password</Button>
              </Link>
            </>
          }
          description="Review your performance, subject status, and current ranking generated from live academic marks."
          eyebrow="Student Dashboard"
          title="Your academic performance at a glance"
        />
      </FadeIn>

      {metrics.report ? (
        <ReportTable report={metrics.report} />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">No report available yet</h2>
            <p className="text-sm text-slate-500">
              Your results will appear once marks are entered and published by your teacher.
            </p>
          </CardHeader>
          <CardContent />
        </Card>
      )}
    </section>
  );
}
