// components/agent/AgentDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Agent } from "@/types/agent";

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

export function AgentDetailModal({
  isOpen,
  onClose,
  agent,
}: AgentDetailModalProps) {
  if (!agent) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "INACTIVE":
        return "bg-red-100 text-red-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agent Details" size="xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {agent.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">ID: {agent.agent_id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium uppercase ${getStatusColor(
                agent.status
              )}`}
            >
              {agent.status}
            </span>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900 mt-1 break-all">
                {agent.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {agent.phone_number}
              </p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Business Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Platform</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {agent.platform_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Commission Fee</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {agent.fee}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Hide Fee</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {agent.hide_fee}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Admin Fee</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {agent.admin_fee
                  ? `Rp ${agent.admin_fee.toLocaleString("id-ID")}`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Agent Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Agent Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Agent Type ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {agent.agent_type_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Agent ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {agent.agent_id}
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
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(agent.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(agent.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}