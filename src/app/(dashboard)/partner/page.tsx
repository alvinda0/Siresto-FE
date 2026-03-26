"use client";

import { PartnerAnalytics } from "@/components/partner/PartnerAnalytics";
import { withRoleProtection } from "@/components/ProtectedRoles";

const PartnerPage = () => {
  return (
    <div className="space-y-6">
         <PartnerAnalytics />
    </div>
  );
};

export default withRoleProtection(PartnerPage, ["Superuser", "Supervisor"]);
