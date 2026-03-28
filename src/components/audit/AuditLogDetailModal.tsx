// components/audit/AuditLogDetailModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AuditLog } from "@/types/audit";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { auditService } from "@/services/audit.service";
import LoadingState from "@/components/LoadingState";

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

const AuditLogDetailModal = ({ isOpen, onClose, log }: AuditLogDetailModalProps) => {
  const [logId, setLogId] = useState<string | null>(null);

  // Fetch detailed log data when modal opens
  const { data: detailedLog, isLoading } = useQuery({
    queryKey: ["audit-log-detail", logId],
    queryFn: () => auditService.getAuditLogById(logId!),
    enabled: !!logId && isOpen,
  });

  useEffect(() => {
    if (isOpen && log?.id) {
      setLogId(log.id);
    } else if (!isOpen) {
      setLogId(null);
    }
  }, [isOpen, log?.id]);

  if (!log) return null;

  // Use detailed log if available, otherwise use the log from props
  const displayLog = detailedLog || log;

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "bg-green-500";
    if (statusCode >= 400 && statusCode < 500) return "bg-yellow-500";
    if (statusCode >= 500) return "bg-red-500";
    return "bg-gray-500";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500";
      case "POST": return "bg-green-500";
      case "PUT": return "bg-yellow-500";
      case "DELETE": return "bg-red-500";
      case "PATCH": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const formatJson = (jsonString?: string) => {
    if (!jsonString) return "N/A";
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonString;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[80vw] sm:max-w-[80vw] overflow-y-auto p-6">
        <SheetHeader className="mb-6">
          <SheetTitle>Audit Log Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <LoadingState message="Loading log details..." submessage="Please wait" fullScreen={false} />
        ) : (
          <div className="space-y-6 pr-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Method</p>
                <Badge className={`${getMethodColor(displayLog.method)} text-white mt-1`}>
                  {displayLog.method}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status Code</p>
                <Badge className={`${getStatusColor(displayLog.status_code)} text-white mt-1`}>
                  {displayLog.status_code}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Path</p>
              <p className="text-sm mt-1 font-mono bg-gray-100 p-2 rounded">{displayLog.path}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Response Time</p>
                <p className="text-sm mt-1">{displayLog.response_time}ms</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Access From</p>
                <p className="text-sm mt-1 capitalize">{displayLog.access_from}</p>
              </div>
            </div>

            <Separator />

            {/* Network Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">IP Address</p>
                <p className="text-sm mt-1 font-mono">{displayLog.ip_address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User Agent</p>
                <p className="text-sm mt-1 break-words" title={displayLog.user_agent}>
                  {displayLog.user_agent}
                </p>
              </div>
            </div>

            {/* IDs */}
            {(displayLog.user_id || displayLog.company_id) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  {displayLog.user_id && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">User ID</p>
                      <p className="text-sm mt-1 font-mono text-xs break-all">{displayLog.user_id}</p>
                    </div>
                  )}
                  {displayLog.company_id && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company ID</p>
                      <p className="text-sm mt-1 font-mono text-xs break-all">{displayLog.company_id}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-sm mt-1">
                  {format(new Date(displayLog.created_at), "PPpp")}
                </p>
              </div>
              {displayLog.updated_at && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Updated At</p>
                  <p className="text-sm mt-1">
                    {format(new Date(displayLog.updated_at), "PPpp")}
                  </p>
                </div>
              )}
            </div>

            {/* Request Body */}
            {displayLog.request_body && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Request Body</p>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto max-h-96 whitespace-pre-wrap break-words">
                    {formatJson(displayLog.request_body)}
                  </pre>
                </div>
              </>
            )}

            {/* Response Body */}
            {displayLog.response_body && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Response Body</p>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto max-h-96 whitespace-pre-wrap break-words">
                    {formatJson(displayLog.response_body)}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AuditLogDetailModal;
