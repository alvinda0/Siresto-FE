// components/user/EditUserModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, UpdateUserPayload } from "@/types/user";
import { AlertCircle, Globe, Loader2, Plus, Trash2 } from "lucide-react";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (payload: UpdateUserPayload) => Promise<void>;
  isLoading: boolean;
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading,
}: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    name: "",
    email: "",
    phone: "",
    ip_whitelist: "",
  });

  const [validationError, setValidationError] = useState<string>("");
  const [checkingIp, setCheckingIp] = useState(false);
  const [ipAddresses, setIpAddresses] = useState<string[]>([""]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        ip_whitelist: user.ip_whitelist || "",
      });

      // Parse IP whitelist into array
      if (user.ip_whitelist) {
        try {
          const ips = JSON.parse(user.ip_whitelist) as string[];
          setIpAddresses(ips.length > 0 ? ips : [""]);
        } catch {
          // If not JSON, try comma-separated
          const ips = user.ip_whitelist
            .split(",")
            .map((ip) => ip.trim())
            .filter((ip) => ip);
          setIpAddresses(ips.length > 0 ? ips : [""]);
        }
      } else {
        setIpAddresses([""]);
      }

      setValidationError("");
    }
  }, [user]);

  // Update formData.ip_whitelist whenever ipAddresses changes
  useEffect(() => {
    const validIps = ipAddresses.filter((ip) => ip.trim());
    setFormData((prev) => ({
      ...prev,
      ip_whitelist: validIps.join(", "),
    }));
  }, [ipAddresses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validation
    if (!formData.name?.trim()) {
      setValidationError("Name is required");
      return;
    }
    if (!formData.email?.trim()) {
      setValidationError("Email is required");
      return;
    }

    await onSubmit(formData);
  };

  const handleClose = () => {
    setValidationError("");
    onClose();
  };

  const handleCheckIp = async () => {
    try {
      setCheckingIp(true);
      const ipData = await userService.checkClientIp();

      // Add client IP to the first empty field or create new field
      const emptyIndex = ipAddresses.findIndex((ip) => !ip.trim());
      if (emptyIndex !== -1) {
        const newIps = [...ipAddresses];
        newIps[emptyIndex] = ipData.client_ip;
        setIpAddresses(newIps);
      } else {
        setIpAddresses([...ipAddresses, ipData.client_ip]);
      }

      toast.success(`Your IP: ${ipData.client_ip}`, {
        description: "IP address has been added to the whitelist",
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setCheckingIp(false);
    }
  };

  const handleAddIpField = () => {
    setIpAddresses([...ipAddresses, ""]);
  };

  const handleRemoveIpField = (index: number) => {
    if (ipAddresses.length > 1) {
      const newIps = ipAddresses.filter((_, i) => i !== index);
      setIpAddresses(newIps);
    }
  };

  const handleIpChange = (index: number, value: string) => {
    const newIps = [...ipAddresses];
    newIps[index] = value;
    setIpAddresses(newIps);
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{validationError}</p>
          </div>
        )}

        <div>
          <Label htmlFor="name" className="text-gray-900 dark:text-white">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-gray-900 dark:text-white">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="mt-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-gray-900 dark:text-white">
            Phone
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="mt-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            placeholder="08xxxxxxxxxx"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-gray-900 dark:text-white">
              IP Whitelist
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleCheckIp}
                disabled={checkingIp || isLoading}
                variant="outline"
                size="sm"
                className="bg-purple-500/10 hover:bg-purple-500/20 border-purple-200 text-purple-700"
              >
                {checkingIp ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Generated IP
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleAddIpField}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add IP
              </Button>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            {ipAddresses.map((ip, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="192.168.1.100"
                  value={ip}
                  onChange={(e) => handleIpChange(index, e.target.value)}
                  className="flex-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                  disabled={isLoading}
                />
                {ipAddresses.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveIpField(index)}
                    disabled={isLoading}
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Add multiple IP addresses for whitelist. Each IP should be entered
            in a separate field.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
