"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { merchantService } from "@/services/merchant.service";
import { agentService } from "@/services/agent.service";
import { merchantTypeService } from "@/services/merchant-type.service";
import { vendorService } from "@/services/vendor.service";
import { Agent } from "@/types/agent";
import { MerchantType } from "@/types/merchant-type";
import { toast } from "sonner";

// Import Shadcn Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

interface Vendor {
    vendor_id: string;
    name: string;
}

interface FormData {
    vendor_id: string;
    agent_id: string;
    name: string;
    merchant_type_id: string;
    status: string;
    environment: string;
    external_id: string;
    api_key: string;
}

interface FormErrors {
    [key: string]: string;
}

const CreateMerchantPage = () => {
    usePageTitle("Create Merchant");
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        vendor_id: "",
        agent_id: "",
        name: "",
        merchant_type_id: "",
        status: "ACTIVE",
        environment: "DEVELOPMENT",
        external_id: "",
        api_key: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [merchantTypes, setMerchantTypes] = useState<MerchantType[]>([]);

    // Loading states per dropdown
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [loadingMerchantTypes, setLoadingMerchantTypes] = useState(false);

    // Fetch vendors on demand
    const fetchVendors = async () => {
        if (vendors.length > 0) return; // Already loaded

        try {
            setLoadingVendors(true);
            const vendorResponse = await vendorService.getVendors();
            setVendors(vendorResponse.data || []);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            toast.error(errorMessage);
        } finally {
            setLoadingVendors(false);
        }
    };

    // Fetch agents on demand
    const fetchAgents = async () => {
        if (agents.length > 0) return; // Already loaded

        try {
            setLoadingAgents(true);
            const agentList = await agentService.getAgentsForSelect();
            setAgents(Array.isArray(agentList) ? agentList : []);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            toast.error(errorMessage);
        } finally {
            setLoadingAgents(false);
        }
    };

    // Fetch merchant types on demand
    const fetchMerchantTypes = async () => {
        if (merchantTypes.length > 0) return; // Already loaded

        try {
            setLoadingMerchantTypes(true);
            const merchantTypeResponse = await merchantTypeService.getMerchantTypes({ limit: 100 });
            setMerchantTypes(merchantTypeResponse.data || []);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            toast.error(errorMessage);
        } finally {
            setLoadingMerchantTypes(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.vendor_id.trim()) {
            newErrors.vendor_id = "Vendor is required";
        }
        if (!formData.agent_id.trim()) {
            newErrors.agent_id = "Agent is required";
        }
        if (!formData.name.trim()) {
            newErrors.name = "Merchant name is required";
        }
        if (!formData.merchant_type_id.trim()) {
            newErrors.merchant_type_id = "Merchant type is required";
        }
        if (!formData.status.trim()) {
            newErrors.status = "Status is required";
        }
        if (!formData.environment.trim()) {
            newErrors.environment = "Environment is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            const payload: {
                vendor_id: string;
                agent_id: string;
                name: string;
                merchant_type_id: string;
                status: string;
                environment: string;
                external_id?: string;
                api_key?: string;
            } = {
                vendor_id: formData.vendor_id,
                agent_id: formData.agent_id,
                name: formData.name,
                merchant_type_id: formData.merchant_type_id,
                status: formData.status,
                environment: formData.environment,
            };

            if (formData.external_id.trim()) {
                payload.external_id = formData.external_id;
            }
            if (formData.api_key.trim()) {
                payload.api_key = formData.api_key;
            }

            await merchantService.createMerchant(payload);

            toast.success("Merchant created successfully! Redirecting...");

            setTimeout(() => {
                router.push("/merchant/list");
            }, 1500);

        } catch (err) {
            const errorMessage = getErrorMessage(err);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={handleGoBack}
                    variant="ghost"
                    size="icon"
                    className="rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Merchant</h1>
                    <p className="text-gray-600 mt-2">Add a new merchant to the system</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white/70 backdrop-blur-md rounded-lg border border-gray-200/50 p-6 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Two Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Vendor Select */}
                            <div className="space-y-2">
                                <Label htmlFor="vendor_id">
                                    Vendor <span className="text-red-600">*</span>
                                </Label>
                                <Select
                                    value={formData.vendor_id}
                                    onValueChange={(value) => handleSelectChange("vendor_id", value)}
                                    onOpenChange={(open) => {
                                        if (open) fetchVendors();
                                    }}
                                >
                                    <SelectTrigger
                                        className={errors.vendor_id ? "border-red-500" : ""}
                                    >
                                        <SelectValue placeholder="Select vendor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingVendors ? (
                                            <SelectItem value="loading" disabled>
                                                Loading vendors...
                                            </SelectItem>
                                        ) : vendors.length === 0 ? (
                                            <SelectItem value="no-data" disabled>
                                                No vendors available
                                            </SelectItem>
                                        ) : (
                                            vendors.map((vendor) => (
                                                <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                                                    {vendor.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.vendor_id && (
                                    <p className="text-sm text-red-600">{errors.vendor_id}</p>
                                )}
                            </div>

                            {/* Agent Select */}
                            <div className="space-y-2">
                                <Label htmlFor="agent_id">
                                    Agent <span className="text-red-600">*</span>
                                </Label>
                                <Select
                                    value={formData.agent_id}
                                    onValueChange={(value) => handleSelectChange("agent_id", value)}
                                    onOpenChange={(open) => {
                                        if (open) fetchAgents();
                                    }}
                                >
                                    <SelectTrigger
                                        className={errors.agent_id ? "border-red-500" : ""}
                                    >
                                        <SelectValue placeholder="Select agent..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingAgents ? (
                                            <SelectItem value="loading" disabled>
                                                Loading agents...
                                            </SelectItem>
                                        ) : agents.length === 0 ? (
                                            <SelectItem value="no-data" disabled>
                                                No agents available
                                            </SelectItem>
                                        ) : (
                                            agents.map((agent) => (
                                                <SelectItem key={agent.agent_id} value={agent.agent_id}>
                                                    {agent.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.agent_id && (
                                    <p className="text-sm text-red-600">{errors.agent_id}</p>
                                )}
                            </div>

                            {/* Merchant Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Merchant Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Input merchant name"
                                    className={errors.name ? "border-red-500" : ""}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Merchant Type Select */}
                            <div className="space-y-2">
                                <Label htmlFor="merchant_type_id">
                                    Merchant Type <span className="text-red-600">*</span>
                                </Label>
                                <Select
                                    value={formData.merchant_type_id}
                                    onValueChange={(value) => handleSelectChange("merchant_type_id", value)}
                                    onOpenChange={(open) => {
                                        if (open) fetchMerchantTypes();
                                    }}
                                >
                                    <SelectTrigger
                                        className={errors.merchant_type_id ? "border-red-500" : ""}
                                    >
                                        <SelectValue placeholder="Select merchant type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingMerchantTypes ? (
                                            <SelectItem value="loading" disabled>
                                                Loading merchant types...
                                            </SelectItem>
                                        ) : merchantTypes.length === 0 ? (
                                            <SelectItem value="no-data" disabled>
                                                No merchant types available
                                            </SelectItem>
                                        ) : (
                                            merchantTypes.map((type) => (
                                                <SelectItem key={type.merchant_type_id} value={type.merchant_type_id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.merchant_type_id && (
                                    <p className="text-sm text-red-600">{errors.merchant_type_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Status Select */}
                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Status <span className="text-red-600">*</span>
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleSelectChange("status", value)}
                                >
                                    <SelectTrigger
                                        className={errors.status ? "border-red-500" : ""}
                                    >
                                        <SelectValue placeholder="Select status..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>

                            {/* Environment Select */}
                            <div className="space-y-2">
                                <Label htmlFor="environment">
                                    Environment <span className="text-red-600">*</span>
                                </Label>
                                <Select
                                    value={formData.environment}
                                    onValueChange={(value) => handleSelectChange("environment", value)}
                                >
                                    <SelectTrigger
                                        className={errors.environment ? "border-red-500" : ""}
                                    >
                                        <SelectValue placeholder="Select environment..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DEVELOPMENT">Development</SelectItem>
                                        <SelectItem value="LIVE">Live</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.environment && (
                                    <p className="text-sm text-red-600">{errors.environment}</p>
                                )}
                            </div>

                            {/* External ID (Optional) */}
                            <div className="space-y-2">
                                <Label htmlFor="external_id">
                                    External ID <span className="text-gray-500 text-xs">(Optional)</span>
                                </Label>
                                <Input
                                    id="external_id"
                                    name="external_id"
                                    value={formData.external_id}
                                    onChange={handleInputChange}
                                    placeholder="e.g., EXT_12345"
                                />
                            </div>

                            {/* API Key (Optional) - Hidden for Netzme */}
                            {vendors.find(v => v.vendor_id === formData.vendor_id)?.name?.toLowerCase() !== 'netzme' && (
                                <div className="space-y-2">
                                    <Label htmlFor="api_key">
                                        API Key <span className="text-gray-500 text-xs">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="api_key"
                                        name="api_key"
                                        value={formData.api_key}
                                        onChange={handleInputChange}
                                        placeholder="e.g., ak_custom123456789"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            onClick={handleGoBack}
                            disabled={loading}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-[#007BFF] hover:bg-[#0056b3]"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-4 h-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                "Create Merchant"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default withRoleProtection(CreateMerchantPage, [
    "Superuser", "Supervisor", "StaffEntry"
]);