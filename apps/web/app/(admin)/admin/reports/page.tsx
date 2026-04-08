import { PagePlaceholder } from "@onlook/ui";

import { ReportOverviewShell } from "../../../../src/components/admin/report-overview-shell";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PagePlaceholder
        eyebrow="Admin"
        title="Reports"
        description="Reserved for session timelines, exports, intervention outcomes, and audit-ready evidence."
      />
      <ReportOverviewShell />
    </div>
  );
}
