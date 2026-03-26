"use client";

import { GroupAnalytics } from "@/components/analytics/GroupAnalytics";
import { withRoleProtection } from "@/components/ProtectedRoles";

function ReportPage() {
  return (
    <div className="container mx-auto p-6">
      <GroupAnalytics />
    </div>
  );
}

export default withRoleProtection(ReportPage, ["Superuser", "Supervisor"]);
