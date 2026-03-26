"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UserPlus,
  Mail,
  Phone,
  Lock,
  User,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Globe,
  Plus,
  Trash2,
} from "lucide-react";
import { userService } from "@/services/user.service";
import { roleService } from "@/services/role.service";
import { partnerService } from "@/services/partner.service";
import { platformService } from "@/services/platform.service";
import { agentService } from "@/services/agent.service";
import { Role } from "@/types/role";
import { Partner } from "@/types/partner";
import { Platform } from "@/types/platform";
import { Agent } from "@/types/agent";
import { CreateUserPayload } from "@/types/user";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { useAuthMe } from "@/hooks/useAuthMe";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { SelectInput } from "@/components/SelectInput";

// ─── Role Constants ────────────────────────────────────────────────────────────
const AGENT_ROLES = ["SuperAgent", "AgentOwner", "AgentStaff"];
const PLATFORM_ROLES = [...AGENT_ROLES, "PlatformOwner", "PlatformStaff"];
const PARTNER_ROLES = [...PLATFORM_ROLES, "PartnerOwner"];

const INTERNAL_ROLES = [
  "System",
  "Superuser",
  "Supervisor",
  "StaffEntry",
  "StaffFinance",
];
const STAFF_ROLES = ["StaffEntry", "StaffFinance"];

const ALLOWED_ROLES_BY_CURRENT: Record<string, string[]> = {
  Superuser: [
    "Supervisor",
    "StaffFinance",
    "StaffEntry",
    "PartnerOwner",
    "PlatformOwner",
    "PlatformStaff",
    "SuperAgent",
    "AgentOwner",
    "AgentStaff",
  ],
  Supervisor: [
    "StaffFinance",
    "StaffEntry",
    "PlatformOwner",
    "PlatformStaff",
    "SuperAgent",
    "AgentOwner",
    "AgentStaff",
  ],
  StaffEntry: [
    "PlatformOwner",
    "PlatformStaff",
    "SuperAgent",
    "AgentOwner",
    "AgentStaff",
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const isRoleTreatedAsInternal = (roleName: string) =>
  INTERNAL_ROLES.includes(roleName);

// ─── Component ─────────────────────────────────────────────────────────────────
const CreateUserPage = () => {
  usePageTitle("Create User");
  const router = useRouter();
  const { data: currentUser } = useAuthMe();

  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingIp, setCheckingIp] = useState(false);
  const [ipAddresses, setIpAddresses] = useState<string[]>([""]);

  const [formData, setFormData] = useState<CreateUserPayload>({
    email: "",
    phone: "",
    name: "",
    password: "",
    role: "",
    is_internal: true,
    partner_id: "",
    platform_id: "",
    agent_id: "",
    ip_whitelist: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<
        keyof CreateUserPayload | "partner_id" | "platform_id" | "agent_id",
        string
      >
    >
  >({});

  // ─── Derived State ───────────────────────────────────────────────────────────
  const selectedRoleName =
    roles.find((r) => r.role_id === formData.role)?.role_name ?? "";
  const needsPartner = PARTNER_ROLES.includes(selectedRoleName);
  const needsPlatform = PLATFORM_ROLES.includes(selectedRoleName);
  const needsAgent = AGENT_ROLES.includes(selectedRoleName);
  const allowedRoles =
    ALLOWED_ROLES_BY_CURRENT[currentUser?.role_name ?? ""] ?? [];

  // ─── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRoles();
    fetchPartners();
  }, []);

  useEffect(() => {
    if (currentUser?.role_name === "StaffEntry") {
      setFormData((prev) => ({ ...prev, is_internal: false }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (formData.partner_id) {
      fetchPlatforms(formData.partner_id);
    } else {
      setPlatforms([]);
      setFormData((prev) => ({ ...prev, platform_id: "", agent_id: "" }));
    }
  }, [formData.partner_id]);

  useEffect(() => {
    if (formData.platform_id) {
      fetchAgents(formData.platform_id);
    } else {
      setAgents([]);
      setFormData((prev) => ({ ...prev, agent_id: "" }));
    }
  }, [formData.platform_id]);

  useEffect(() => {
    const validIps = ipAddresses.filter((ip) => ip.trim());
    setFormData((prev) => ({ ...prev, ip_whitelist: validIps.join(", ") }));
  }, [ipAddresses]);

  // ─── Fetchers ────────────────────────────────────────────────────────────────
  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      setRoles(await roleService.getRoles());
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      setPartners(await partnerService.getPartners());
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const fetchPlatforms = async (partnerId: string) => {
    try {
      const data = await platformService.getPlatforms({
        limit: 100,
        partner_id: partnerId,
      });
      setPlatforms(data.data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const fetchAgents = async (platformId: string) => {
    try {
      const response = await agentService.getAgents({
        limit: 100,
        platform_id: platformId,
      });
      setAgents(response.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ─── Form Handlers ───────────────────────────────────────────────────────────
  const handleInputChange = (field: keyof CreateUserPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      partner_id: "",
      platform_id: "",
      agent_id: "",
    }));
    if (formErrors.role)
      setFormErrors((prev) => ({ ...prev, role: undefined }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      is_internal: value === "internal",
      role: "",
      partner_id: "",
      platform_id: "",
      agent_id: "",
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ─── IP Whitelist Handlers ───────────────────────────────────────────────────
  const handleCheckIp = async () => {
    try {
      setCheckingIp(true);
      const { client_ip } = await userService.checkClientIp();
      const emptyIndex = ipAddresses.findIndex((ip) => !ip.trim());

      if (emptyIndex !== -1) {
        const updated = [...ipAddresses];
        updated[emptyIndex] = client_ip;
        setIpAddresses(updated);
      } else {
        setIpAddresses([...ipAddresses, client_ip]);
      }

      toast.success(`Your IP: ${client_ip}`, {
        description: "IP address has been added to the whitelist",
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCheckingIp(false);
    }
  };

  const handleIpChange = (index: number, value: string) => {
    const updated = [...ipAddresses];
    updated[index] = value;
    setIpAddresses(updated);
  };

  const handleAddIpField = () => setIpAddresses([...ipAddresses, ""]);
  const handleRemoveIpField = (index: number) => {
    if (ipAddresses.length > 1)
      setIpAddresses(ipAddresses.filter((_, i) => i !== index));
  };

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateUserPayload, string>> = {};

    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    if (!formData.role) errors.role = "Role is required";

    if (needsAgent) {
      if (!formData.partner_id)
        errors.partner_id = "Partner is required for Agent roles";
      if (!formData.platform_id)
        errors.platform_id = "Platform is required for Agent roles";
      if (!formData.agent_id)
        errors.agent_id = "Agent is required for Agent roles";
    } else if (needsPlatform) {
      if (!formData.partner_id)
        errors.partner_id = "Partner is required for Platform roles";
      if (!formData.platform_id)
        errors.platform_id = "Platform is required for Platform roles";
    } else if (needsPartner) {
      if (!formData.partner_id)
        errors.partner_id = "Partner is required for Partner roles";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const payload: CreateUserPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        is_internal: isRoleTreatedAsInternal(selectedRoleName),
        ip_whitelist: formData.ip_whitelist ?? "",
        ...(needsPartner && { partner_id: formData.partner_id }),
        ...(needsPlatform && { platform_id: formData.platform_id }),
        ...(needsAgent && { agent_id: formData.agent_id }),
      };

      await userService.createUser(payload);
      setSuccess(true);
      toast.success("User created successfully!");
      setTimeout(() => router.push("/users/list"), 2000);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Role Filter Logic ───────────────────────────────────────────────────────
  const filterRoles = (role: Role) => {
    if (role.role_name === "System") return false;
    if (allowedRoles.length > 0 && !allowedRoles.includes(role.role_name))
      return false;

    return formData.is_internal
      ? role.is_internal || STAFF_ROLES.includes(role.role_name)
      : !role.is_internal && !STAFF_ROLES.includes(role.role_name);
  };

  // ─── Success Screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              User Created Successfully!
            </h3>
            <p className="text-gray-600 mb-4">Redirecting to user list...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF] mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New User</h1>
          <p className="text-sm text-gray-600">Add a new user to the system</p>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#007BFF]/10 rounded-lg">
              <UserPlus className="w-6 h-6 text-[#007BFF]" />
            </div>
            <div>
              <CardTitle className="text-2xl">User Information</CardTitle>
              <CardDescription>Fill in the details below</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* User Type */}
            {currentUser?.role_name !== "StaffEntry" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.is_internal ? "internal" : "external"}
                  onValueChange={handleUserTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={formErrors.email ? "border-red-500" : ""}
                  autoComplete="off"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={rolesLoading}
                >
                  <SelectTrigger
                    className={formErrors.role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.filter(filterRoles).map((role) => (
                      <SelectItem key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <p className="text-sm text-red-600">{formErrors.role}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    onKeyPress={handleKeyPress}
                    className={`pr-10 ${formErrors.password ? "border-red-500" : ""}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-600">{formErrors.password}</p>
                )}
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* IP Whitelist */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    IP Whitelist
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleCheckIp}
                      disabled={checkingIp}
                      variant="outline"
                      size="sm"
                      className="bg-purple-500/10 hover:bg-purple-500/20 border-purple-200 text-purple-700"
                    >
                      {checkingIp ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />{" "}
                          Loading...
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 mr-1" /> Generated IP
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddIpField}
                      variant="outline"
                      size="sm"
                      className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add IP
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {ipAddresses.map((ip, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="192.168.1.100"
                        value={ip}
                        onChange={(e) => handleIpChange(index, e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      {ipAddresses.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => handleRemoveIpField(index)}
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
                <p className="text-xs text-gray-500">
                  Add multiple IP addresses for whitelist. Each IP should be
                  entered in a separate field.
                </p>
              </div>

              {/* Partner */}
              {!formData.is_internal && needsPartner && (
                <div className="space-y-2">
                  <Label
                    htmlFor="partner_id"
                    className="flex items-center gap-2"
                  >
                    Partner <span className="text-red-500">*</span>
                  </Label>
                  <SelectInput
                    data={partners}
                    value={formData.partner_id ?? ""}
                    onChange={(value) => handleInputChange("partner_id", value)}
                    valueKey="partner_id"
                    labelKey="name"
                    placeholder="Select partner"
                    searchPlaceholder="Search partner..."
                    emptyText="No partner found."
                    className={formErrors.partner_id ? "border-red-500" : ""}
                  />
                  {formErrors.partner_id && (
                    <p className="text-sm text-red-600">
                      {formErrors.partner_id}
                    </p>
                  )}
                </div>
              )}

              {/* Platform */}
              {!formData.is_internal && needsPlatform && (
                <div className="space-y-2">
                  <Label
                    htmlFor="platform_id"
                    className="flex items-center gap-2"
                  >
                    Platform <span className="text-red-500">*</span>
                  </Label>
                  <SelectInput
                    data={platforms}
                    value={formData.platform_id ?? ""}
                    onChange={(value) =>
                      handleInputChange("platform_id", value)
                    }
                    valueKey="platform_id"
                    labelKey="name"
                    placeholder="Select platform"
                    searchPlaceholder="Search platform..."
                    emptyText="No platform found."
                    disabled={!formData.partner_id}
                    className={formErrors.platform_id ? "border-red-500" : ""}
                  />
                  {formErrors.platform_id && (
                    <p className="text-sm text-red-600">
                      {formErrors.platform_id}
                    </p>
                  )}
                </div>
              )}

              {/* Agent */}
              {!formData.is_internal && needsAgent && (
                <div className="space-y-2">
                  <Label htmlFor="agent_id" className="flex items-center gap-2">
                    Agent <span className="text-red-500">*</span>
                  </Label>
                  <SelectInput
                    data={agents}
                    value={formData.agent_id ?? ""}
                    onChange={(value) => handleInputChange("agent_id", value)}
                    valueKey="agent_id"
                    labelKey="name"
                    placeholder="Select agent"
                    searchPlaceholder="Search agent..."
                    emptyText="No agent found."
                    disabled={!formData.platform_id}
                    className={formErrors.agent_id ? "border-red-500" : ""}
                  />
                  {formErrors.agent_id && (
                    <p className="text-sm text-red-600">
                      {formErrors.agent_id}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || rolesLoading}
                className="bg-[#007BFF] hover:bg-[#0066DD] text-white px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" /> Create User
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withRoleProtection(CreateUserPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);
