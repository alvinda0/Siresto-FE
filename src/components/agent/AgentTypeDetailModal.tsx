// components/agent/AgentTypeDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { AgentType } from "@/types/agentType";

interface AgentTypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentType: AgentType | null;
}

export function AgentTypeDetailModal({
  isOpen,
  onClose,
  agentType,
}: AgentTypeDetailModalProps) {
  if (!agentType) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agent Type Details"
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {agentType.type}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Agent Type Classification
          </p>
        </div>

        {/* Basic Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {agentType.type}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Agent Type ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {agentType.agent_type_id}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {agentType.description && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-base text-gray-900 leading-relaxed">
                {agentType.description}
              </p>
            </div>
          </div>
        )}

        {/* Timeline Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Timeline Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(agentType.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(agentType.updated_at)}
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            System Information
          </h4>
          <div>
            <p className="text-sm text-gray-600">Agent Type System ID</p>
            <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
              {agentType.agent_type_id}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}