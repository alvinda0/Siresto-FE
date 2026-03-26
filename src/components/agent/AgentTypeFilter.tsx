// components/agentType/AgentTypeFilter.tsx
"use client";

import React, { useState } from "react";
import { Search, X, Plus } from "lucide-react";
import { AgentTypeQueryParams } from "@/types/agentType";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AgentTypeFilterProps {
    onApplyFilters: (filters: AgentTypeQueryParams) => void;
    onCreateClick?: () => void;
}

export const AgentTypeFilter: React.FC<AgentTypeFilterProps> = ({ onApplyFilters, onCreateClick }) => {
    const [search, setSearch] = useState("");

    const applyFilters = () => {
        const filters: AgentTypeQueryParams = {
            page: 1,
            limit: 100,
        };

        if (search.trim()) filters.search = search.trim();

        onApplyFilters(filters);
    };

    const handleClear = () => {
        setSearch("");
        onApplyFilters({ page: 1, limit: 100 });
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
                </div>
                
                {/* Tombol Create Agent Type */}
                {onCreateClick && (
                    <Button
                        onClick={onCreateClick}
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                    >
                        <Plus className="w-4 h-4" />
                        Create New
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[300px]">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            id="search"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                            placeholder="Search by type name..."
                            className="pl-10 bg-white/50 backdrop-blur-sm"
                        />
                    </div>
                </div>

                <Button
                    onClick={applyFilters}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                >
                    Apply
                </Button>

                <Button
                    onClick={handleClear}
                    variant="outline"
                    className="bg-red-500/20 hover:bg-red-500/30 border-red-200 text-red-700"
                >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                </Button>
            </div>
        </div>
    );
};