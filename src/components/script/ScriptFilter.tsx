// components/script/ScriptFilter.tsx
"use client";

import React, { useState } from "react";
import { Search, X, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenerateEngineModal } from "@/components/script/GenerateEngineModal";

export interface ScriptFilterParams {
  category?: string;
  engine?: string;
  code?: string;
  is_enable?: boolean;
}

interface ScriptFilterProps {
  onApplyFilters: (filters: ScriptFilterParams) => void;
  onRefresh: () => void; // ✅ NEW: callback to refresh table after generate
}

export const ScriptFilter: React.FC<ScriptFilterProps> = ({
  onApplyFilters,
  onRefresh,
}) => {
  const [category, setCategory] = useState("");
  const [engine, setEngine] = useState("");
  const [code, setCode] = useState("");
  const [isEnable, setIsEnable] = useState<string>("all");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false); // ✅ NEW

  const applyFilters = () => {
    const filters: ScriptFilterParams = {};

    if (category.trim()) filters.category = category.trim();
    if (engine.trim()) filters.engine = engine.trim();
    if (code.trim()) filters.code = code.trim();
    if (isEnable !== "all") filters.is_enable = isEnable === "true";

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setCategory("");
    setEngine("");
    setCode("");
    setIsEnable("all");
    onApplyFilters({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const handleGenerateSuccess = () => {
    onRefresh(); // ✅ Refresh table data after generate
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
          </div>

          {/* ✅ NEW: Generate Button */}
          <Button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Generate Script</span>
          </Button>
        </div>

        {/* Filter Row */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1">
            <Input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by category..."
              className="bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="flex-1">
            <Input
              type="text"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by engine..."
              className="bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="flex-1">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by code..."
              className="bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="w-45">
            <Select value={isEnable} onValueChange={setIsEnable}>
              <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Enabled</SelectItem>
                <SelectItem value="false">Disabled</SelectItem>
              </SelectContent>
            </Select>
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

      {/* ✅ NEW: Generate Engine Modal */}
      <GenerateEngineModal
        open={isGenerateModalOpen}
        onOpenChange={setIsGenerateModalOpen}
        onSuccess={handleGenerateSuccess}
      />
    </>
  );
};