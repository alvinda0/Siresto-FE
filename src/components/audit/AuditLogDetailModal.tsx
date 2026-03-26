// components/audit/AuditLogDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { AuditLog } from "@/types/audit";

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLog: AuditLog | null;
}

export function AuditLogDetailModal({
  isOpen,
  onClose,
  auditLog,
}: AuditLogDetailModalProps) {
  if (!auditLog) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const getStatusColor = (success: boolean) => {
    return success
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Audit Log Details" size="xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {auditLog.action} - {auditLog.resource}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Event ID: {auditLog.id}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium uppercase ${getStatusColor(
                auditLog.success
              )}`}
            >
              {auditLog.success ? "SUCCESS" : "FAILED"}
            </span>
          </div>
        </div>

        {/* Action Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Action Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Action</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {auditLog.action}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Resource</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {auditLog.resource}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {auditLog.success ? "Success" : "Failed"}
              </p>
            </div>
          </div>
          
          {/* Details Section */}
          {auditLog.details && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Details</p>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  {auditLog.details.message && (
                    <p className="text-sm text-gray-900 mb-2">
                      <span className="font-medium">Message:</span> {auditLog.details.message}
                    </p>
                  )}
                  {Object.entries(auditLog.details)
                    .filter(([key]) => key !== 'message')
                    .map(([key, value]) => (
                      <p key={key} className="text-sm text-gray-900 mb-1">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Error Message</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {auditLog.error_message || "-"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Resource ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {auditLog.resource_id}
              </p>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            User Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {auditLog.user_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {auditLog.username || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Session ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {auditLog.session_id}
              </p>
            </div>
          </div>
        </div>

        {/* Network Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Network Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">IP Address</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {auditLog.ip_address || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User Agent</p>
              <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                {auditLog.user_agent || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            System Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Audit ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {auditLog.id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Request ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {auditLog.request_id}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Timeline Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Timestamp</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(auditLog.timestamp)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(auditLog.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}