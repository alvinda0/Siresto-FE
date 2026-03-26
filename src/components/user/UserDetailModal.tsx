// components/user/UserDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { User } from "@/types/user";
import { CheckCircle, XCircle } from "lucide-react";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailModal({
  isOpen,
  onClose,
  user,
}: UserDetailModalProps) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const getRoleBadgeColor = (roleName: string): string => {
    const colors: { [key: string]: string } = {
      Superuser: "bg-purple-100 text-purple-700",
      Supervisor: "bg-blue-100 text-blue-700",
      StaffEntry: "bg-green-100 text-green-700",
      StaffFinance: "bg-yellow-100 text-yellow-700",
      AgentStaff: "bg-indigo-100 text-indigo-700",
    };
    return colors[roleName] || "bg-gray-100 text-gray-700";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Detail" size="xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium uppercase ${getRoleBadgeColor(
                user.role_name
              )}`}
            >
              {user.role_name}
            </span>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {user.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {user.phone || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <span
                className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium mt-1 ${getRoleBadgeColor(
                  user.role_name
                )}`}
              >
                {user.role_name}
              </span>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Status Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Internal User</p>
              <div className="flex items-center gap-2 mt-1">
                {user.is_internal ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-base font-medium text-green-700">
                      Yes
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-base font-medium text-gray-700">
                      No
                    </span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Verified Status</p>
              <div className="flex items-center gap-2 mt-1">
                {user.is_verified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-base font-medium text-green-700">
                      Verified
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-base font-medium text-red-700">
                      Not Verified
                    </span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Two-Factor Authentication</p>
              <div className="flex items-center gap-2 mt-1">
                {user.is_2fa ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-base font-medium text-green-700">
                      Enabled
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-base font-medium text-gray-700">
                      Disabled
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related IDs */}
        {(user.platform_id || user.agent_id) && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Related Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.platform_id && (
                <div>
                  <p className="text-sm text-gray-600">Platform ID</p>
                  <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                    {user.platform_id}
                  </p>
                </div>
              )}
              {user.agent_id && (
                <div>
                  <p className="text-sm text-gray-600">Agent ID</p>
                  <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                    {user.agent_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            System Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {user.user_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {user.role_id}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Timeline
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(user.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(user.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}