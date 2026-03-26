// components/script/GenerateEngineModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Cpu, X, ChevronDown, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectInput } from "@/components/SelectInput";
import { agentService } from "@/services/agent.service";
import { scriptService } from "@/services/script.service";
import { Agent } from "@/types/agent";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface GenerateEngineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const GenerateEngineModal: React.FC<GenerateEngineModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [engines, setEngines] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [selectedEngine, setSelectedEngine] = useState<string>("");
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isLoadingEngines, setIsLoadingEngines] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch agents and engines when modal opens
  useEffect(() => {
    if (open) {
      fetchAgents();
      fetchEngines();
    } else {
      // Reset state on close
      setSelectedAgent("");
      setSelectedEngine("");
    }
  }, [open]);

  const fetchAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const data = await agentService.getAgentsForSelect();
      setAgents(data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setAgents([]); // ✅ fallback jika error
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const fetchEngines = async () => {
    try {
      setIsLoadingEngines(true);
      const data = await scriptService.getEngineBlueprints();
      setEngines(data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setEngines([]); // ✅ fallback jika error
    } finally {
      setIsLoadingEngines(false);
    }
  };

  const isFormValid =
    selectedAgent.trim() !== "" && selectedEngine.trim() !== "";

  const handleSubmit = async () => {
    if (!isFormValid) return;

    try {
      setIsSubmitting(true);
      await scriptService.generateEngineSettings({
        agent: selectedAgent,
        engine: selectedEngine,
      });

      toast.success("Engine settings generated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  // Transform engines string[] to object array for SelectInput
  const engineOptions = engines.map((e) => ({ value: e, label: e }));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125 bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-linear-to-br from-blue-600 to-indigo-700 px-6 py-5">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="relative flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-semibold">
                Generate Engine Settings
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-sm mt-0.5">
                Select an agent and engine to generate new settings
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Agent Select */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Agent
              <span className="text-red-500 ml-1">*</span>
            </Label>
            {isLoadingAgents ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-400">Loading agents...</span>
              </div>
            ) : (
              <SelectInput
                data={agents}
                value={selectedAgent}
                onChange={setSelectedAgent}
                valueKey="agent_id"
                labelKey="name"
                secondaryLabelKey="platform_name"
                placeholder="Select agent..."
                searchPlaceholder="Search agent..."
                emptyText="No agents found."
                className="bg-white/50 backdrop-blur-sm border-gray-200 hover:border-blue-300 transition-colors"
              />
            )}
            {agents.length === 0 && !isLoadingAgents && (
              <p className="text-xs text-gray-400">No agents available</p>
            )}
          </div>

          {/* Engine Select */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Engine
              <span className="text-red-500 ml-1">*</span>
            </Label>
            {isLoadingEngines ? (
              <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-400">
                  Loading engines...
                </span>
              </div>
            ) : (
              <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-200 hover:border-blue-300 transition-colors">
                  <SelectValue placeholder="Select engine..." />
                </SelectTrigger>
                <SelectContent>
                  {engines.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      No engines available
                    </SelectItem>
                  ) : (
                    engines.map((engine) => (
                      <SelectItem key={engine} value={engine}>
                        <div className="flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-blue-500" />
                          <span className="capitalize">{engine}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
            {engines.length === 0 && !isLoadingEngines && (
              <p className="text-xs text-gray-400">No engines available</p>
            )}
          </div>

          {/* Preview Summary */}
          {(selectedAgent || selectedEngine) && (
            <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Summary
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Agent</span>
                  <span className="font-medium text-gray-800">
                    {selectedAgent
                      ? agents.find((a) => a.agent_id === selectedAgent)
                          ?.name || selectedAgent
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Engine</span>
                  <span className="font-medium text-gray-800 capitalize">
                    {selectedEngine || "-"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="bg-white hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 min-w-30"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Generate</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
