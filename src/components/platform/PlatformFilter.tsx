// components/platform/PlatformFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Plus } from "lucide-react";
import { PlatformQueryParams } from "@/types/platform";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SelectInput } from "@/components/SelectInput";
import { Partner } from "@/types/partner";
import { partnerService } from "@/services/partner.service";
import { platformService } from "@/services/platform.service";
import { Platform } from "@/types/platform";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const PLACEHOLDER_ALL = "__all__";

interface PlatformFilterProps {
    onApplyFilters: (filters: PlatformQueryParams) => void;
}

export const PlatformFilter: React.FC<PlatformFilterProps> = ({ 
    onApplyFilters 
}) => {
    const router = useRouter();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);
    const [loadingPlatforms, setLoadingPlatforms] = useState(false);

    // Filter states
    const [search, setSearch] = useState("");
    const [partnerId, setPartnerId] = useState<string>(PLACEHOLDER_ALL);
    const [platformId, setPlatformId] = useState<string>(PLACEHOLDER_ALL);
    const [status, setStatus] = useState<string>(PLACEHOLDER_ALL);

    // Fetch partners and platforms on mount
    useEffect(() => {
        fetchPartners();
        fetchPlatforms();
    }, []);

    const fetchPartners = async () => {
        try {
            setLoadingPartners(true);
            const data = await partnerService.getPartners();
            setPartners(data);
        } catch (error) {
            console.error("Failed to fetch partners:", error);
            toast.error("Failed to load partners");
        } finally {
            setLoadingPartners(false);
        }
    };

    const fetchPlatforms = async () => {
        try {
            setLoadingPlatforms(true);
            const data = await platformService.getPlatformsForSelect();
            setPlatforms(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch platforms:", error);
            toast.error("Failed to load platforms");
        } finally {
            setLoadingPlatforms(false);
        }
    };

    const applyFilters = () => {
        const filters: PlatformQueryParams = {
            page: 1,
            limit: 10,
        };

        if (search.trim()) {
            filters.search = search.trim();
        }
        if (partnerId !== PLACEHOLDER_ALL) {
            filters.partner_id = partnerId;
        }
        if (platformId !== PLACEHOLDER_ALL) {
            filters.platform_id = platformId;
        }
        if (status !== PLACEHOLDER_ALL) {
            filters.status = status;
        }

        onApplyFilters(filters);
    };

    const handleClear = () => {
        setSearch("");
        setPartnerId(PLACEHOLDER_ALL);
        setPlatformId(PLACEHOLDER_ALL);
        setStatus(PLACEHOLDER_ALL);
        
        // Reset filters to initial state to reload all data
        const resetFilters: PlatformQueryParams = {
            page: 1,
            limit: 10,
        };
        
        onApplyFilters(resetFilters);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            applyFilters();
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Search & Filter
                    </h3>
                </div>

                <Button
                    onClick={() => router.push("/platforms/create")}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                </Button>
            </div>

            {/* Main Filter Row */}
            <div className="flex flex-wrap items-end gap-3">
                {/* Search Input */}
                <div className="flex-1 min-w-[300px]">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            id="search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Search by platform name or referral code..."
                            className="pl-10 bg-white/50 backdrop-blur-sm"
                        />
                    </div>
                </div>

                {/* Apply Button */}
                <Button
                    onClick={applyFilters}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                >
                    Apply
                </Button>

                {/* Advanced Toggle */}
                <Button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    variant="outline"
                    className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Advanced
                    <ChevronDown
                        className={`w-4 h-4 ml-2 transition-transform ${
                            showAdvanced ? "rotate-180" : ""
                        }`}
                    />
                </Button>

                {/* Clear Button */}
                <Button
                    onClick={handleClear}
                    variant="outline"
                    className="bg-red-500/20 hover:bg-red-500/30 border-red-200 text-red-700"
                >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="flex flex-wrap items-end gap-3 pt-4 border-t border-gray-200">
                    {/* Partner Select */}
                    <div className="w-[250px]">
                        <Label htmlFor="partner">Partner</Label>
                        <div className="mt-2">
                            <SelectInput
                                data={[
                                    { partner_id: PLACEHOLDER_ALL, name: "All Partners" },
                                    ...partners
                                ]}
                                value={partnerId}
                                onChange={setPartnerId}
                                valueKey="partner_id"
                                labelKey="name"
                                placeholder="All Partners"
                                searchPlaceholder="Search partners..."
                                emptyText="No partners found."
                                disabled={loadingPartners}
                                className="bg-white/50 backdrop-blur-sm"
                            />
                        </div>
                        {loadingPartners && (
                            <p className="text-xs text-gray-500 mt-1">
                                Loading partners...
                            </p>
                        )}
                    </div>

                    {/* Platform Select */}
                    <div className="w-[250px]">
                        <Label htmlFor="platform">Platform</Label>
                        <div className="mt-2">
                            <SelectInput
                                data={[
                                    { platform_id: PLACEHOLDER_ALL, name: "All Platforms", referral: "" },
                                    ...platforms
                                ]}
                                value={platformId}
                                onChange={setPlatformId}
                                valueKey="platform_id"
                                labelKey="name"
                                secondaryLabelKey="referral"
                                placeholder="All Platforms"
                                searchPlaceholder="Search platforms..."
                                emptyText="No platforms found."
                                disabled={loadingPlatforms}
                                className="bg-white/50 backdrop-blur-sm"
                            />
                        </div>
                        {loadingPlatforms && (
                            <p className="text-xs text-gray-500 mt-1">
                                Loading platforms...
                            </p>
                        )}
                    </div>

                    {/* Status Select */}
                    <div className="w-[200px]">
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger 
                                id="status" 
                                className="mt-2 bg-white/50 backdrop-blur-sm"
                            >
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={PLACEHOLDER_ALL}>
                                    All Status
                                </SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    );
};