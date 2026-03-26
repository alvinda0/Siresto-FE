import React from "react";
import { Modal } from "@/components/Modal";

interface IpWhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  ipAddresses: string[];
}

export const IpWhitelistModal: React.FC<IpWhitelistModalProps> = ({
  isOpen,
  onClose,
  ipAddresses,
}) => {
  const getIpType = (ipAddr: string) => {
    if (
      ipAddr.startsWith("10.") ||
      ipAddr.startsWith("192.168.") ||
      ipAddr.startsWith("172.")
    ) {
      return {
        label: "Private",
        color: "bg-blue-50 border-blue-200 text-blue-700",
        badge: "bg-blue-100 text-blue-700",
      };
    }
    return {
      label: "Public",
      color: "bg-green-50 border-green-200 text-green-700",
      badge: "bg-green-100 text-green-700",
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="IP Whitelist" size="md">
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Daftar IP address yang diizinkan untuk user ini:
        </p>

        <div className="space-y-2">
          {ipAddresses.map((ip, index) => {
            const ipType = getIpType(ip);

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${ipType.color} flex items-center justify-between`}
              >
                <span className="font-mono text-sm font-medium">{ip}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${ipType.badge}`}
                >
                  {ipType.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
